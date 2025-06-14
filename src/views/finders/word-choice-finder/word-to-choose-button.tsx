import React from 'react';
import { observer } from 'mobx-react-lite';
import { WordToChoose } from '@/models/finders/word-choice-finder/word-to-choose';

interface WordToChooseButtonProps { wordToChoose: WordToChoose; }

export const WordToChooseButton: React.FC<WordToChooseButtonProps> = observer(({ wordToChoose }) => {
  return (
    <span
      className={`word-to-choose-button ${wordToChoose.enabled ? '' : 'disabled'}`}
      onClick={wordToChoose.enabled ? () => wordToChoose.choose() : undefined}
      title={wordToChoose.enabled ? `Choose "${wordToChoose.word}"` : 'Choose a word to find first'}
    >
      {wordToChoose.word}
    </span>
  );
});
