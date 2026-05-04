import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Mic, MicOff, Loader2 } from 'lucide-react';
import { enhancedSpeechRecognition } from '@/lib/utils/enhanced-speech-recognition';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

interface SearchFilterSectionProps {
  searchQuery: string;
  onSearchInputSubmit: (value: string) => void;
}

export const SearchFilterSection: React.FC<SearchFilterSectionProps> = ({
  searchQuery,
  onSearchInputSubmit,
}) => {
  const [inputValue, setInputValue] = useState(searchQuery);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize speech recognition
  useEffect(() => {
    const initializeSpeechRecognition = async () => {
      try {
        await enhancedSpeechRecognition.initialize({
          continuous: false,
          interimResults: true,
          language: 'en-US',
          autoRestart: false,
        });

        // Subscribe to state changes
        const unsubscribeState = enhancedSpeechRecognition.onStateChange(
          (state) => {
            setIsListening(state.isListening);
          }
        );

        // Subscribe to results
        const unsubscribeResults = enhancedSpeechRecognition.onResult(
          (result) => {
            if (result.isFinal) {
              setInputValue(result.transcript);
              setIsListening(false);
              enhancedSpeechRecognition.stop();
            } else {
              setInputValue(result.transcript);
            }
          }
        );

        setIsInitialized(true);

        return () => {
          unsubscribeState();
          unsubscribeResults();
          enhancedSpeechRecognition.dispose();
        };
      } catch (error) {
        logger.error('Failed to initialize speech recognition:', error);
        toast.error('Voice recognition is not available on this device');
      }
    };

    initializeSpeechRecognition();
  }, []);

  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearch = useCallback(() => {
    setIsProcessing(true);
    onSearchInputSubmit(inputValue.trim());

    // Simulate processing time for better UX
    setTimeout(() => {
      setIsProcessing(false);
    }, 500);
  }, [inputValue, onSearchInputSubmit]);

  const toggleVoiceRecognition = async () => {
    if (!isInitialized) {
      toast.error('Voice recognition is not available');
      return;
    }

    try {
      if (isListening) {
        enhancedSpeechRecognition.stop();
        setIsListening(false);
      } else {
        setInputValue('');
        await enhancedSpeechRecognition.start();
      }
    } catch (error) {
      logger.error('Voice recognition error:', error);
      toast.error('Failed to start voice recognition');
      setIsListening(false);
    }
  };

  const getVoiceButtonIcon = () => {
    if (!isInitialized) return <MicOff className="h-4 w-4" />;
    if (isListening) {
      return (
        <div className="flex items-center justify-center space-x-0.5">
          <div
            className="h-3 w-0.5 animate-pulse rounded-full bg-white"
            style={{
              animationDuration: '0.8s',
              animationDelay: '0s',
            }}
          ></div>
          <div
            className="h-4 w-0.5 animate-pulse rounded-full bg-white"
            style={{
              animationDuration: '0.6s',
              animationDelay: '0.1s',
            }}
          ></div>
          <div
            className="h-2 w-0.5 animate-pulse rounded-full bg-white"
            style={{
              animationDuration: '1s',
              animationDelay: '0.2s',
            }}
          ></div>
          <div
            className="h-5 w-0.5 animate-pulse rounded-full bg-white"
            style={{
              animationDuration: '0.7s',
              animationDelay: '0.3s',
            }}
          ></div>
          <div
            className="h-3 w-0.5 animate-pulse rounded-full bg-white"
            style={{
              animationDuration: '0.9s',
              animationDelay: '0.4s',
            }}
          ></div>
        </div>
      );
    }
    return <Mic className="h-4 w-4" />;
  };

  const getVoiceButtonVariant = () => {
    if (!isInitialized) return 'ghost';
    if (isListening) return 'destructive';
    return 'outline';
  };

  return (
    <div className="dark:border-primary/10 rounded-xl border-b border-gray-200 bg-white p-4 shadow-xl sm:p-5 dark:bg-gray-900">
      <div className="flex w-full flex-col gap-4 sm:items-center sm:justify-between md:flex-row">
        {/* Center - Enhanced Search Bar */}
        <div className="w-full flex-1">
          <div className="relative w-full">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
            <Input
              type="text"
              placeholder="Search candidates, skills, or experience..."
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              className={cn(
                'focus:border-primary focus:ring-primary dark:bg-primary/10 h-12 w-full border-gray-200 bg-white pr-32 pl-10 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-400',
                isListening && 'border-primary ring-primary/20'
              )}
              disabled={isProcessing}
            />

            {/* Voice Recognition Button */}
            <Button
              type="button"
              variant={getVoiceButtonVariant()}
              size="sm"
              onClick={toggleVoiceRecognition}
              disabled={!isInitialized || isProcessing}
              className={cn(
                'absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 transform rounded-md p-0 transition-all duration-200',
                isListening && 'bg-primary hover:bg-primary/80 text-white',
                !isInitialized && 'cursor-not-allowed opacity-50'
              )}
              title={
                !isInitialized
                  ? 'Voice recognition not available'
                  : isListening
                    ? 'Stop listening'
                    : 'Start voice search'
              }
            >
              {getVoiceButtonIcon()}
            </Button>

            {/* Search Button */}
            <Button
              type="button"
              onClick={handleSearch}
              disabled={isProcessing}
              className="bg-primary hover:bg-primary/90 absolute top-1/2 right-12 h-8 w-8 -translate-y-1/2 transform rounded-md p-0 text-white"
              title="Search"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Search Tips */}
      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        Tip: Use voice search for hands-free searching. Try saying &quot;find
        candidates with React experience&quot; or &quot;search for senior
        developers&quot;
      </div>
    </div>
  );
};
