'use client';

import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import CodeMirror from '@uiw/react-codemirror';
import { motion } from 'framer-motion';

interface CodeAnswerProps {
  template: string;
  languages: string[];
  testCases?: string[];
  value: string;
  onChange: (value: string) => void;
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
}

const getLanguageExtension = (lang: string) => {
  switch (lang) {
    case 'javascript':
      return javascript();
    case 'python':
      return python();
    case 'java':
      return java();
    case 'cpp':
      return cpp();
    default:
      return javascript();
  }
};

export const CodeAnswer = ({
  template,
  languages,
  testCases,
  value,
  onChange,
  selectedLanguage,
  onLanguageChange,
}: CodeAnswerProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-4"
    >
      <div className="flex justify-end">
        <select
          value={selectedLanguage}
          onChange={(e) => {
            onLanguageChange(e.target.value);
            // Reset to template when language changes
            if (!value) {
              onChange(template);
            }
          }}
          className="bg-background text-foreground border-input hover:border-primary rounded-xl border px-4 py-2 text-sm font-medium transition-colors"
        >
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang.charAt(0).toUpperCase() + lang.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="border-input overflow-hidden rounded-lg border">
        <CodeMirror
          value={value || template}
          height="250px"
          theme="dark"
          extensions={[getLanguageExtension(selectedLanguage)]}
          onChange={onChange}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightSpecialChars: true,
            foldGutter: true,
            drawSelection: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            syntaxHighlighting: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            crosshairCursor: true,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            closeBracketsKeymap: true,
            searchKeymap: true,
            foldKeymap: true,
            completionKeymap: true,
            lintKeymap: true,
          }}
        />
      </div>

      {testCases && testCases.length > 0 && (
        <div className="border-input bg-background rounded-lg border p-4">
          <h3 className="text-foreground mb-2 text-sm font-medium">
            Test Cases:
          </h3>
          <ul className="text-muted-foreground space-y-1 text-xs sm:text-sm">
            {testCases.map((test, i) => (
              <li key={i} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{test}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
};
