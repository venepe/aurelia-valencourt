import React, { useState, useEffect } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import { motion } from "framer-motion";
import { useSwipeable } from 'react-swipeable';
import { useVoiceModal } from '../VoiceModal';

const textBlurbs = [
  "Any cocktail ideas that would pair well with Flamin' Hot Cheetos?",
  "What cocktail would work best with a Taco Bell Crunchwrap Supreme?",
  "What kind of drink would complement a Big Mac?",
  "Got any cocktail suggestions to go with Panda Express' Orange Chicken?",
  "What’s a good drink to pair with KFC fried chicken?",
  "What can I make if all I have is orange juice and vodka?",
  "I love a Harvey Wallbanger, but I don’t have Galliano. Any suggestions?",
  "What’s the perfect drink to go with a Wagyu Kobe beef steak?",
  "I’m planning on eating Beef Wellington—what cocktail would enhance the experience?",
  "If I were having foie gras, what kind of cocktail should I be sipping on?",
  "Any recommendations for a cocktail that would pair beautifully with a soufflé?",
];

const TextCarousel = ({ interval = 5000, isPaused = false }) => {
  const { openVoiceModal } = useVoiceModal();
  const [index, setIndex] = useState(0); // Start at a consistent value
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward
  const [timer, setTimer] = useState(null);

  const resetTimer = () => {
    if (timer) clearInterval(timer);
    if (!isPaused) {
      setTimer(
        setInterval(() => {
          setDirection(1);
          setIndex((prev) => (prev + 1) % textBlurbs.length);
        }, interval)
      );
    }
  };

  const nextBlurb = () => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % textBlurbs.length);
    resetTimer();
  };

  const prevBlurb = () => {
    setDirection(-1);
    setIndex((prev) => (prev - 1 + textBlurbs.length) % textBlurbs.length);
    resetTimer();
  };

  const handlers = useSwipeable({
    onSwipedLeft: nextBlurb,
    onSwipedRight: prevBlurb,
    preventDefaultTouchmoveEvent: true, // Prevent default scrolling
  });

  const handleSearch = (questionText) => {
    openVoiceModal(questionText);
  }

  useEffect(() => {
    setIndex(Math.floor(Math.random() * textBlurbs.length)); // Set random value only on mount
  }, []);

  useEffect(() => {
    resetTimer();
    return () => clearInterval(timer);
  }, [interval, isPaused]);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        maxWidth: 500,
        mt: 1,
        margin: "auto",
        overflow: "hidden",
      }}
      {...handlers}
    >
      <IconButton aria-label={'Previous'} onClick={prevBlurb} sx={{ width: 48, height: 48 }}>
        <ArrowBackIos sx={{ fontSize: 12 }} />
      </IconButton>

      <Box sx={{ width: "80%", textAlign: "center", position: "relative", overflow: "hidden", cursor: "pointer" }} onClick={() => handleSearch(textBlurbs[index])}>
        <motion.div
          key={index}
          initial={{ x: direction * 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -direction * 100, opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h4" sx={{ fontSize: '1.0rem' }} color="textSecondary">
            <i>{textBlurbs[index]}</i>
          </Typography>
        </motion.div>
      </Box>

      <IconButton aria-label={'Next'} onClick={nextBlurb} sx={{ width: 48, height: 48 }}>
        <ArrowForwardIos sx={{ fontSize: 12 }} />
      </IconButton>
    </Box>
  );
};

export default TextCarousel;
