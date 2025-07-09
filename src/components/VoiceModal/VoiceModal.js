import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Modal, Box, Typography, TextField } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import AVTextInput from './AVTextInput';
import CaptionOverlay from './CaptionOverlay';
import TextChatToggleButton from './TextChatToggleButton';
import { API_URL } from '../../config';
import { generateCocktailUrl, isInAppBrowser } from '../../utilities';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { setConversationHistory } from '../../store/reducers/conversationHistorySlice';
import { getStore } from '../../store';
import R from '../../resources';

const VoiceModalContext = createContext();

export const useVoiceModal = () => useContext(VoiceModalContext);

const particlePulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.3);
    opacity: 1;
  }
`;

const Particle = styled('div')(({ delay, color, size, isSearching }) => ({
  width: size,
  height: size,
  borderRadius: '50%',
  backgroundColor: color,
  opacity: 0.8,
  margin: '0 5px',
  animation: `${particlePulse} ${isSearching ? '0.4s' : '1.8s'} ${delay}s infinite ease-in-out`,
}));

const ParticlesContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  flexWrap: 'wrap',
  maxWidth: '100px',
  height: '100px',
  margin: '0 auto',
  padding: '10px',
});

export const VoiceModalProvider = ({ children }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { id } = router.query;
  const currentCocktailIdRef = useRef(id);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [currentOpenEndedQuestion, setCurrentOpenEndedQuestion] = useState('');
  const isListeningRef = useRef(false);
  const transcriptRef = useRef('');
  const previousTranscriptRef = useRef('');
  const didCloseModalRef = useRef(false);
  const controllerRef = useRef(null);
  const [isSearching, setIsSearching] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [errorState, setErrorState] = useState({ type: '', message: '' });
  const pauseTimeoutRef = useRef(null);
  const audioRef = useRef(null);
  const [isCaptionOverlayOpen, setIsCaptionOverlayOpen] = useState(false);
  const [currentCaption, setCurrentCaption] = useState('');
  const [captions, setCaptions] = useState([]);
  const isTextChatEnabled = useSelector((state) => state.textChat.isTextChatEnabled);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.lang = 'en-US';
        recognitionInstance.interimResults = true;
        recognitionInstance.continuous = true;
        setRecognition(recognitionInstance);
      } else {
        setErrorState({ type: 'unsupported', message: 'Speech recognition is not supported in this browser. Please try a different browser.' });
      }
    }
  }, []);

  useEffect(() => {
    if (isTextChatEnabled) {
      if (recognition) {
        recognition.onerror = null;
      }
      abortListening();
    } else if (isVoiceModalOpen) {
      openVoiceModal();
      setTranscript(currentOpenEndedQuestion);
    }
  }, [isTextChatEnabled]);

  const isCurrentCocktailInPath = () => {
    return router.asPath.includes(currentCocktailIdRef.current);
  };

  const resetRefs = () => {
    if (transcriptRef.current) {
      transcriptRef.current = '';
    }
    if (previousTranscriptRef.current) {
      previousTranscriptRef.current = '';
    }
    if (didCloseModalRef.current) {
      didCloseModalRef.current = false;
    }
  };

  const openVoiceModal = (searchText, callback = () => {}) => {
    resetRefs();
    if (audioRef.current) {
      audioRef.current.ontimeupdate = null;
    }
    if (searchText && searchText.length > 0) {
      transcriptRef.current = searchText.trim();
      setTranscript(transcriptRef.current);
    } else if (isCurrentCocktailInPath() && currentOpenEndedQuestion && currentOpenEndedQuestion.length > 0) {
      setTranscript(currentOpenEndedQuestion);
    } else {
      setTranscript('');
    }
    if (errorState.type !== 'unsupported' && errorState.type !== 'permission') {
      setErrorState({ type: '', message: '' });
    }
    setCaptions([]);
    setCurrentCaption('');
    setIsCaptionOverlayOpen(false);
    setIsVoiceModalOpen(true);

    // Stop any ongoing audio playback
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; // Reset playback to the start
      audioRef.current.src = '';
    }

    // Initialize audioRef in response to user interaction to satisfy iOS policies
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = setTimeout(() => {
        closeVoiceModal();
      }, 30000);
    if (isTextChatEnabled) {
      if (searchText && searchText.length > 0) {
        handleSearch(searchText);
        callback(true);
      }
    } else if (!errorState.type) startListening(searchText, (success) => {
      if (success) {
        callback(success);
      } else {
        handleSearch(searchText);
        callback(true);
      }
    });
  };

  const cancelFetch = () => {
    if (controllerRef.current) {
      controllerRef.current.abort(new DOMException('Fetch aborted due to user action', 'UserAbortError'));
    }
  };

  const closeVoiceModal = () => {
    didCloseModalRef.current = true;
    cancelFetch();
    stopListening();
    setIsVoiceModalOpen(false);
  };

  const startListening = (searchText, callback) => {
    if (!recognition) return;
    isListeningRef.current = true;
    if (typeof searchText === 'string' && searchText.length > 0) {
      recognition.onresult = null;
      recognition.onspeechend = null;
      recognition.onend = null;

      recognition.onerror = (event) => {
        if (event.error === 'aborted') {
          // console.warn("aborted");
        } else if (event.error === 'not-allowed') {
          setErrorState({
            type: 'permission',
            message: "Unable to access microphone. Please check your browser's permissions and enable access to speak with Aurelia."
          });
          stopListening();
        } else if (event.error === 'no-speech') {
          // console.warn("No speech detected");
        } else {
          console.error('Speech recognition error:', event.error);
          setErrorState({
            type: 'unsupported',
            message: `Something went wrong with speech recognition (${event.error}). Please check your browser compatibility or try refreshing the page.`
          });
          stopListening();
        }
        callback(false);
      };

      recognition.onstart = () => {
        if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
        pauseTimeoutRef.current = setTimeout(() => {
          if (isListeningRef.current) {
            abortListening();
            if (!didCloseModalRef.current) {
              handleSearch(transcriptRef.current);
            }
          }
        }, 1800);
        if (callback) {
          callback(true);
        }
      }

      recognition.start();
    } else {
      recognition.onstart = null;
      recognition.onresult = (event) => {
        let currentTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            let result = event.results[i];
            let transcript = result[0].transcript;
            let confidence = result[0].confidence;

            if (result.isFinal) {
                // Only append final results if confidence is greater than 0
                if (confidence > 0) {
                    finalTranscript += transcript + ' ';
                }
            } else {
                // Append real-time (non-final) transcript
                currentTranscript += transcript + ' ';
            }
        }

        // Store confirmed transcripts to avoid duplication
        if (finalTranscript.trim().length > 0) {
            previousTranscriptRef.current += finalTranscript.trim() + ' ';
        }

        // Display real-time transcript
        let displayTranscript = previousTranscriptRef.current + currentTranscript.trim();
        transcriptRef.current = displayTranscript.trim();
        if (transcriptRef.current.length > 0) {
          setTranscript(transcriptRef.current);
        }

        if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
        pauseTimeoutRef.current = setTimeout(() => {
          if (isListeningRef.current) {
            stopListening();
          }
        }, 2000);
      };

      recognition.onerror = (event) => {
        if (event.error === 'aborted') {
          isListeningRef.current = false;
          if (isInAppBrowser()) {
            console.error('Speech recognition error:', event.error);
            setErrorState({
              type: 'unsupported',
              message: `You are using an in-app browser. Open in your default browser app to speak with Aurelia.`
            });
            stopListening();
          } else {
            closeVoiceModal();
          }
        } else if (event.error === 'not-allowed') {
          setErrorState({
            type: 'permission',
            message: "Unable to access microphone. Please check your browser's permissions and enable access to speak with Aurelia."
          });
          stopListening();
        } else if (event.error === 'no-speech') {
          // console.warn("No speech detected");
        } else {
          console.error('Speech recognition error:', event.error);
          setErrorState({
            type: 'unsupported',
            message: `Something went wrong with speech recognition (${event.error}). Please check your browser compatibility or try refreshing the page.`
          });
          stopListening();
        }
      };

      recognition.onspeechend = () => {
        if (isListeningRef.current) {
          stopListening();
        }
      };

      recognition.onend = () => {
        if (isListeningRef.current) {
          startListening();
        } else {
          if (!didCloseModalRef.current) {
            handleSearch(transcriptRef.current);
          }
        }
      };

      recognition.start();
    }
  };

  const stopListening = () => {
    isListeningRef.current = false;
    if (recognition) {
      recognition.stop();
    }
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
  };

  const abortListening = () => {
    isListeningRef.current = false;
    if (recognition) {
      recognition.abort();
    }
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
  };

  const closeOverlayAndStopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; // Reset audio
      audioRef.current.src = '';
    }
    setIsCaptionOverlayOpen(false);
    setCurrentCaption('');

    // Remove the time update listener to prevent further caption updates
    audioRef.current.ontimeupdate = null;
  };

  const playNarrativeAudio = (narrativeUrl, captions, openEndedQuestion) => {
    if (audioRef.current) {
      audioRef.current.src = narrativeUrl;
      audioRef.current.load();

      // Time update handler for updating captions
      const handleTimeUpdate = () => {
        const currentTime = audioRef.current.currentTime;
        const currentLine = captions.find(
          (line, index) =>
            line.time <= currentTime &&
            (index === captions.length - 1 || captions[index + 1].time > currentTime)
        );
        if (currentLine) {
          setCurrentCaption(currentLine.text);
          setIsCaptionOverlayOpen(true);
        }
      };

      // Define the route change handler to stop audio and hide captions
      const handleRouteChange = () => {
        audioRef.current.pause();
        audioRef.current.currentTime = 0; // Reset audio
        audioRef.current.src = '';
        setCurrentOpenEndedQuestion('');
        setIsCaptionOverlayOpen(false); // Hide overlay
        setCurrentCaption(''); // Clear caption

        // Remove the time update listener to prevent further caption updates
        audioRef.current.ontimeupdate = null;
      };

      // Add route change listener
      router.events.on('routeChangeStart', handleRouteChange);

      // Remove listener when audio ends or component unmounts
      audioRef.current.onended = () => {
        if (audioRef.current) {
          audioRef.current.src = '';
        }
        audioRef.current.ontimeupdate = null;
        setIsCaptionOverlayOpen(false);
        setCurrentCaption('');
        router.events.off('routeChangeStart', handleRouteChange); // Clean up listener
        if (openEndedQuestion && openEndedQuestion.length > 0) {
          openVoiceModal();
          setTranscript(openEndedQuestion);
        }
      };

      // Attach the time update handler and start audio playback
      audioRef.current.ontimeupdate = handleTimeUpdate;
      audioRef.current.play().catch((error) => {
        console.error("Error playing narrative audio:", error);
      });
    }
  };

  const handleSearch = async (finalTranscript) => {
    setIsSearching(true);
    const latestConversationHistory = getStore().getState().conversationHistory.history;
    const unitsOfMeasure = getStore().getState().unitsOfMeasure.unit;
    if (finalTranscript.trim().length > 1) {
      const controller = new AbortController();
      controllerRef.current = controller;

      try {
        const response = await fetch(`${API_URL}/ask`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ input: finalTranscript, conversationHistory: latestConversationHistory, unitsOfMeasure }),
          signal: controller.signal,
        });
        const result = await response.json();

        const {
          output: { cocktailId, title, narrativeUrl, captions, openEndedQuestion },
          conversationHistory: updatedHistory,
        } = result;
        dispatch(setConversationHistory(updatedHistory));
        setCurrentOpenEndedQuestion(openEndedQuestion);

        if (typeof cocktailId === 'string' && cocktailId.length > 0 && typeof title === 'string' && title.length > 0) {
          const cocktailUrl = generateCocktailUrl(cocktailId, title);
          setCaptions(captions);

          // Define the route change complete handler
          const onRouteChangeComplete = () => {
            // Play the audio with captions once the route change is complete
            closeVoiceModal();
            if (narrativeUrl && captions) {
              playNarrativeAudio(narrativeUrl, captions, openEndedQuestion);
            }
            router.events.off('routeChangeComplete', onRouteChangeComplete); // Clean up listener
          };

          if (cocktailId !== currentCocktailIdRef.current) {
            // Set up listener before navigation
            currentCocktailIdRef.current = cocktailId;
            router.events.on('routeChangeComplete', onRouteChangeComplete);
            // Start navigation
            await router.push(generateCocktailUrl(cocktailId, title));
          } else {
            onRouteChangeComplete();
          }
        } else if (narrativeUrl.length > 0 && captions.length > 0) {
          closeVoiceModal();
          playNarrativeAudio(narrativeUrl, captions, openEndedQuestion);
        } else if (narrativeUrl.length === 0 && captions.length === 0) {
          if (openEndedQuestion && openEndedQuestion.length > 0) {
            openVoiceModal();
            setTranscript(openEndedQuestion);
          } else {
            closeVoiceModal();
          }
        } else {
          resetRefs();
          setTranscript(R.strings.SEARCH_REPHRASE_PLACEHOLDER);
          startListening();
        }
      } catch (error) {
        resetRefs();
        setTranscript(R.strings.SEARCH_REPHRASE_PLACEHOLDER);
        if (error.name !== 'UserAbortError') {
          startListening();
          console.error('Error fetching suggestions:', error);
        }
      } finally {
        setIsSearching(false);
        controllerRef.current = null;
      }
    } else {
      setIsSearching(false);
    }
  };

  const handleAVSearch = async (text) => {
    if (text && text.trim().length > 0) {
      setTranscript(text);
      handleSearch(text);
    } else {
      closeVoiceModal();
    }
  }

  return (
    <VoiceModalContext.Provider value={{ openVoiceModal, closeVoiceModal, isVoiceModalOpen, isCaptionOverlayOpen }}>
      {children}

      <Modal
        open={isVoiceModalOpen}
        onClose={closeVoiceModal}
        aria-labelledby="voice-modal-title"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: '500px',
            bgcolor: 'rgba(0, 0, 0, 0.9)',
            boxShadow: 24,
            p: 4,
            paddingBottom: 8,
            borderRadius: '16px 16px 0 0',
            textAlign: 'center',
            animation: `0.4s ease-out`,
            outline: 'none',
            position: 'relative',
          }}
        >
          {isTextChatEnabled && !isSearching && !currentCaption ? (
            <AVTextInput label={transcript} onSubmit={handleAVSearch} />
          ) : (
            <>
            {!currentCaption && (
                <ParticlesContainer>
                  <Particle delay={0} color="#C6C2B1" size="8px" isSearching={isSearching} />
                  <Particle delay={0.2} color="#C6C2B1" size="10px" isSearching={isSearching} />
                  <Particle delay={0.4} color="#999999" size="12px" isSearching={isSearching} />
                  <Particle delay={0.6} color="#666666" size="10px" isSearching={isSearching} />
                  <Particle delay={0.8} color="#333333" size="8px" isSearching={isSearching} />
                  <Particle delay={0.6} color="#666666" size="10px" isSearching={isSearching} />
                  <Particle delay={0.4} color="#999999" size="12px" isSearching={isSearching} />
                  <Particle delay={0.2} color="#C6C2B1" size="10px" isSearching={isSearching} />
                  <Particle delay={0} color="#C6C2B1" size="8px" isSearching={isSearching} />
                </ParticlesContainer>
              )}
              <Typography
                variant="body2"
                sx={{
                  mt: 1,
                  color: '#ddd',
                  fontStyle: isSearching ? 'italic' : 'normal',
                  fontWeight: isSearching ? 600 : 'normal'
                }}
              >
                {transcript || R.strings.SEARCH_PLACEHOLDER}
              </Typography>
            </>
          )}
          <Box sx={{
            position: 'absolute',
            bottom: 8, // Adjust this value based on your layout needs
            right: 8, // Ensure the button is aligned to the bottom-right
          }}>
            <TextChatToggleButton speechError={errorState.message} />
          </Box>
        </Box>
      </Modal>
      <CaptionOverlay
        isOpen={isCaptionOverlayOpen}
        caption={currentCaption}
        onClose={closeOverlayAndStopAudio}
      />
    </VoiceModalContext.Provider>
  );
};

export default VoiceModalProvider;
