import React from 'react';
import { Player } from '@lottiefiles/react-lottie-player'; // Komponen untuk Lottie
import loaderAnimation from './loader.json'; // Impor Lottie JSON

const Loader: React.FC = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-white dark:bg-dark">
      <Player
        autoplay
        loop
        src={loaderAnimation}
        className="h-40 w-40"
      />
    </div>
  );
};

export default Loader;
