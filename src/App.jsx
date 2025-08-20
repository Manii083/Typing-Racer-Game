import React, { useState, useEffect, useCallback, useRef } from 'react';

// Word bank for the game
const WORD_BANK = [
  'react', 'javascript', 'typescript', 'frontend', 'backend', 'coding', 'developer',
  'function', 'component', 'state', 'props', 'hooks', 'router', 'api', 'server',
  'database', 'array', 'object', 'string', 'number', 'boolean', 'variable',
  'algorithm', 'debugging', 'testing', 'deployment', 'version', 'control',
  'github', 'npm', 'yarn', 'webpack', 'babel', 'eslint', 'prettier'
];

// Game configuration
const GAME_CONFIG = {
  WORD_FALL_SPEED: 1, // pixels per frame
  WORD_SPAWN_INTERVAL: 2000, // milliseconds
  GAME_HEIGHT: 500,
  MAX_WORDS_ON_SCREEN: 8,
  WPM_UPDATE_INTERVAL: 1000
};

// Individual Word Component
const Word = ({ word, position, onComplete, onMiss }) => {
  const [top, setTop] = useState(position.top);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTop(prev => {
        const newTop = prev + GAME_CONFIG.WORD_FALL_SPEED;
        
        // Check if word reached bottom
        if (newTop > GAME_CONFIG.GAME_HEIGHT - 50) {
          onMiss(word);
          return prev;
        }
        
        return newTop;
      });
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [word, onMiss]);

  return (
    <div
      className="absolute text-lg font-bold text-blue-600 px-2 py-1 bg-white rounded shadow-lg border-2 border-blue-200 transition-all duration-200 select-none"
      style={{
        left: `${position.left}px`,
        top: `${top}px`,
        transform: 'translateX(-50%)',
      }}
    >
      {word.text}
    </div>
  );
};

// Car Component with Animation
const Car = ({ wpm, gameActive }) => {
  const [position, setPosition] = useState(10);
  
  useEffect(() => {
    if (gameActive) {
      // Car moves based on WPM (0-100 WPM maps to 10%-90% of screen)
      const targetPosition = Math.min(Math.max((wpm / 100) * 80 + 10, 10), 90);
      setPosition(targetPosition);
    } else {
      setPosition(10);
    }
  }, [wpm, gameActive]);

  return (
    <div
      className="absolute bottom-8 transition-all duration-1000 ease-out"
      style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
    >
      <div className="relative">
        {/* Car Body */}
        <div className="w-16 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow-lg">
          {/* Car Details */}
          <div className="absolute top-1 left-2 w-3 h-2 bg-blue-200 rounded opacity-70"></div>
          <div className="absolute top-1 right-2 w-3 h-2 bg-blue-200 rounded opacity-70"></div>
          <div className="absolute -bottom-1 left-1 w-3 h-3 bg-gray-800 rounded-full"></div>
          <div className="absolute -bottom-1 right-1 w-3 h-3 bg-gray-800 rounded-full"></div>
        </div>
        
        {/* Speed Lines */}
        {wpm > 20 && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-px bg-yellow-400 mb-1 animate-pulse"
                style={{
                  width: `${Math.min(wpm / 10, 20)}px`,
                  animationDelay: `${i * 100}ms`
                }}
              ></div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Stats Display Component
const Stats = ({ score, wpm, accuracy, streak, timeLeft }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-blue-600">{score}</div>
          <div className="text-sm text-gray-600">Score</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-600">{wpm}</div>
          <div className="text-sm text-gray-600">WPM</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-purple-600">{accuracy}%</div>
          <div className="text-sm text-gray-600">Accuracy</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-orange-600">{streak}</div>
          <div className="text-sm text-gray-600">Streak</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-red-600">{timeLeft}</div>
          <div className="text-sm text-gray-600">Time</div>
        </div>
      </div>
    </div>
  );
};

// Input Box Component
const InputBox = ({ value, onChange, onSubmit, gameActive, placeholder }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (gameActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameActive]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSubmit();
    }
  };

  return (
    <div className="mt-4">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={!gameActive}
        className="w-full px-4 py-3 text-lg border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
        autoComplete="off"
        spellCheck="false"
      />
    </div>
  );
};

// Main Game Board Component
const GameBoard = ({ 
  words, 
  gameActive, 
  onWordComplete, 
  onWordMiss, 
  children 
}) => {
  return (
    <div className="relative w-full bg-gradient-to-b from-sky-200 to-green-200 rounded-lg shadow-lg overflow-hidden"
         style={{ height: `${GAME_CONFIG.GAME_HEIGHT}px` }}>
      
      {/* Background Road */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gray-600">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-yellow-400 transform -translate-y-1/2"></div>
        {/* Road dashes */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute top-1/2 bg-white h-2 w-8 transform -translate-y-1/2"
            style={{ left: `${i * 12.5}%`, marginLeft: '-16px' }}
          ></div>
        ))}
      </div>

      {/* Clouds */}
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute bg-white rounded-full opacity-80"
          style={{
            width: `${60 + i * 20}px`,
            height: `${30 + i * 10}px`,
            top: `${20 + i * 30}px`,
            left: `${20 + i * 30}%`,
            animation: `float ${3 + i}s ease-in-out infinite alternate`
          }}
        ></div>
      ))}

      {/* Falling Words */}
      {words.map((word) => (
        <Word
          key={word.id}
          word={word}
          position={word.position}
          onComplete={onWordComplete}
          onMiss={onWordMiss}
        />
      ))}

      {children}

      <style>{`
        @keyframes float {
          from { transform: translateY(0px); }
          to { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

// Main App Component
const TypingSpeedRacer = () => {
  // Game State
  const [gameState, setGameState] = useState('waiting'); // 'waiting', 'playing', 'gameOver'
  const [words, setWords] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [score, setScore] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  
  // Tracking variables
  const [totalWords, setTotalWords] = useState(0);
  const [correctWords, setCorrectWords] = useState(0);
  const [totalChars, setTotalChars] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(null);
  
  // Calculate WPM whenever totalChars changes
  useEffect(() => {
    if (gameStartTime && gameState === 'playing') {
      const currentTime = Date.now();
      const timeElapsed = (currentTime - gameStartTime) / 1000 / 60; // minutes
      if (timeElapsed > 0) {
        const calculatedWPM = Math.round(totalChars / 5 / timeElapsed);
        setWpm(calculatedWPM);
      }
    }
  }, [totalChars, gameStartTime, gameState]);

  // Refs for intervals
  const gameTimerRef = useRef(null);
  const wordSpawnerRef = useRef(null);
  const wpmCalculatorRef = useRef(null);

  // Generate random word
  const generateWord = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * WORD_BANK.length);
    const text = WORD_BANK[randomIndex];
    const leftPosition = Math.random() * 80 + 10; // 10% to 90% of screen width
    
    return {
      id: Date.now() + Math.random(),
      text,
      position: { left: leftPosition, top: -30 },
      completed: false
    };
  }, []);

  // Start Game
  const startGame = useCallback(() => {
    setGameState('playing');
    setWords([]);
    setCurrentInput('');
    setScore(0);
    setWpm(0);
    setAccuracy(100);
    setStreak(0);
    setTimeLeft(60);
    setGameStartTime(Date.now());
    setTotalWords(0);
    setCorrectWords(0);
    setTotalChars(0);

    // Start game timer
    gameTimerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('gameOver');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Start word spawner
    wordSpawnerRef.current = setInterval(() => {
      setWords(prevWords => {
        if (prevWords.length < GAME_CONFIG.MAX_WORDS_ON_SCREEN) {
          return [...prevWords, generateWord()];
        }
        return prevWords;
      });
    }, GAME_CONFIG.WORD_SPAWN_INTERVAL);

    // Start WPM calculator
    const wpmStartTime = Date.now();
    wpmCalculatorRef.current = setInterval(() => {
      setWpm(prevWpm => {
        const currentTime = Date.now();
        const timeElapsed = (currentTime - wpmStartTime) / 1000 / 60; // minutes
        if (timeElapsed > 0) {
          setTotalChars(currentTotalChars => {
            const calculatedWPM = Math.round(currentTotalChars / 5 / timeElapsed);
            return currentTotalChars;
          });
        }
        return prevWpm;
      });
    }, GAME_CONFIG.WPM_UPDATE_INTERVAL);

  }, [generateWord, gameStartTime, totalChars]);

  // End Game
  const endGame = useCallback(() => {
    setGameState('gameOver');
    clearInterval(gameTimerRef.current);
    clearInterval(wordSpawnerRef.current);
    clearInterval(wpmCalculatorRef.current);
  }, []);

  // Handle Word Completion
  const handleWordComplete = useCallback((completedWord) => {
    setWords(prev => prev.filter(word => word.id !== completedWord.id));
    setScore(prev => prev + completedWord.text.length * 10);
    setCorrectWords(prev => {
      const newCorrect = prev + 1;
      // Update accuracy with new values
      setTotalWords(prevTotal => {
        const newTotal = prevTotal + 1;
        setAccuracy(Math.round(newCorrect / newTotal * 100));
        return newTotal;
      });
      return newCorrect;
    });
    setTotalChars(prev => prev + completedWord.text.length);
    setStreak(prev => prev + 1);
  }, []);

  // Handle Word Miss (reached bottom)
  const handleWordMiss = useCallback((missedWord) => {
    setWords(prev => prev.filter(word => word.id !== missedWord.id));
    setStreak(0);
    
    // Update accuracy
    setTotalWords(prev => {
      const newTotal = prev + 1;
      setCorrectWords(prevCorrect => {
        setAccuracy(Math.round(prevCorrect / newTotal * 100));
        return prevCorrect;
      });
      return newTotal;
    });
  }, []);

  // Handle Input Submit
  const handleInputSubmit = useCallback(() => {
    if (!currentInput.trim()) return;

    const matchingWord = words.find(word => 
      word.text.toLowerCase() === currentInput.toLowerCase().trim()
    );

    if (matchingWord) {
      handleWordComplete(matchingWord);
    } else {
      setStreak(0);
    }

    setCurrentInput('');
  }, [currentInput, words, handleWordComplete]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      clearInterval(gameTimerRef.current);
      clearInterval(wordSpawnerRef.current);
      clearInterval(wpmCalculatorRef.current);
    };
  }, []);

  // End game when time runs out
  useEffect(() => {
    if (timeLeft === 0 && gameState === 'playing') {
      endGame();
    }
  }, [timeLeft, gameState, endGame]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🏎️ Typing Speed Racer
          </h1>
          <p className="text-gray-600">
            Type the falling words before they hit the ground!
          </p>
        </div>

        {/* Game Stats */}
        {gameState !== 'waiting' && (
          <Stats
            score={score}
            wpm={wpm}
            accuracy={accuracy}
            streak={streak}
            timeLeft={timeLeft}
          />
        )}

        {/* Game Board */}
        <GameBoard
          words={words}
          gameActive={gameState === 'playing'}
          onWordComplete={handleWordComplete}
          onWordMiss={handleWordMiss}
        >
          <Car wpm={wpm} gameActive={gameState === 'playing'} />
        </GameBoard>

        {/* Input Section */}
        <InputBox
          value={currentInput}
          onChange={setCurrentInput}
          onSubmit={handleInputSubmit}
          gameActive={gameState === 'playing'}
          placeholder={gameState === 'waiting' ? 'Click Start Game to begin!' : 'Type the words you see falling...'}
        />

        {/* Game Controls */}
        <div className="text-center mt-6">
          {gameState === 'waiting' && (
            <button
              onClick={startGame}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-lg"
            >
              Start Game
            </button>
          )}
          
          {gameState === 'playing' && (
            <button
              onClick={endGame}
              className="px-8 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200 shadow-lg"
            >
              End Game
            </button>
          )}
          
          {gameState === 'gameOver' && (
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Game Over!</h2>
              <div className="space-y-2 mb-4">
                <p><span className="font-semibold">Final Score:</span> {score}</p>
                <p><span className="font-semibold">Words Per Minute:</span> {wpm}</p>
                <p><span className="font-semibold">Accuracy:</span> {accuracy}%</p>
                <p><span className="font-semibold">Best Streak:</span> {streak}</p>
              </div>
              <button
                onClick={() => {
                  setGameState('waiting');
                  // Reset all game state
                  setWords([]);
                  setCurrentInput('');
                  setScore(0);
                  setWpm(0);
                  setAccuracy(100);
                  setStreak(0);
                  setTimeLeft(60);
                  setGameStartTime(null);
                  setTotalWords(0);
                  setCorrectWords(0);
                  setTotalChars(0);
                  // Clear any remaining intervals
                  clearInterval(gameTimerRef.current);
                  clearInterval(wordSpawnerRef.current);
                  clearInterval(wpmCalculatorRef.current);
                }}
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 shadow-lg"
              >
                Play Again
              </button>
            </div>
          )}
        </div>

        {/* Instructions */}
        {gameState === 'waiting' && (
          <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
            <h3 className="text-xl font-bold mb-3 text-gray-800">How to Play</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Words will fall from the top of the screen</li>
              <li>Type each word exactly and press Enter</li>
              <li>Your car moves faster as your WPM increases</li>
              <li>Don't let words reach the bottom - it breaks your streak!</li>
              <li>Try to maintain high accuracy for better scores</li>
              <li>You have 60 seconds to score as many points as possible</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default TypingSpeedRacer;