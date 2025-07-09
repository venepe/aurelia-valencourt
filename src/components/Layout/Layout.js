import AppBar from '../AppBar';
import Footer from '../Footer';
import VoiceActionButton from '../VoiceActionButton';

export default function Layout({ children }) {
  return (
    <>
      <AppBar />
      <div>{children}</div>
      <Footer />
      <VoiceActionButton />
    </>
  );
}
