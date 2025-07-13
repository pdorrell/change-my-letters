import React from 'react';
import { observer } from 'mobx-react-lite';
import { Reset } from '@/models/reset/reset';
import { ActionButton } from '@/lib/views/action-button';
import { FilterControls } from '@/lib/views/filter-controls';
import { Panel } from '@/lib/views/panel';
import { Help } from '@/lib/components/help';
import { GroupRight } from '@/lib/views/group-right';
import { Inspectable } from '@/lib/inspector';
import { Page } from '@/lib/views/page';

/**
 * Controls component for Reset page
 */
interface ResetControlsProps { resetInteraction: Reset; }

export const ResetControls: React.FC<ResetControlsProps> = observer(({ resetInteraction }) => {
  return (
    <Panel
      visible={true}
      inspectorTitle="ResetControls"
    >
      <Help title="Reset Controls">{`
        Use these controls to filter and select your new starting word. The filter options let you narrow down words by length and type. The 'Choose Random' button will randomly select a word from the filtered results, which is helpful when you can't decide or want to be surprised.`}
      </Help>
      <FilterControls filter={resetInteraction.filter} />
      <GroupRight>
        <ActionButton action={resetInteraction.randomAction}>Choose Random</ActionButton>
      </GroupRight>
    </Panel>
  );
});

/**
 * Word choice component for Reset page
 */
interface ResetWordChoiceProps { resetInteraction: Reset; }

export const ResetWordChoice: React.FC<ResetWordChoiceProps> = observer(({ resetInteraction }) => {
  const handleWordClick = (word: string) => {
    // Get the Word object from the word graph
    const wordObj = resetInteraction.appState.wordGraph.getNode(word);
    if (wordObj) {
      resetInteraction.setNewWord(wordObj);
    }
  };

  // Get filtered words
  const filteredWords = resetInteraction.filteredWords;

  return (
    <Panel
      visible={false}
      inspectorTitle="ResetWordChoice"
    >
      <Help title="Word Selection">{`
        This is your word selection area. All available words that match your filter criteria are displayed here. Click on any word to choose it as your new starting word. This will reset the current page (Changer or Maker) and take you back to begin working with your selected word.`}
      </Help>
      <div className="reset-word-choice">
        {filteredWords.length > 0 ? (
          <p>
            {filteredWords.map((word, index) => (
              <React.Fragment key={word}>
                <span
                  className="reset-word-option"
                  onClick={() => handleWordClick(word)}
                  title={`Set word changer to '${word}'`}
                >
                  {word}
                </span>
                {index < filteredWords.length - 1 && ' '}
              </React.Fragment>
            ))}
          </p>
        ) : (
          <p className="reset-no-words">
            No words match the current filter.
          </p>
        )}
      </div>
    </Panel>
  );
});

/**
 * Full page component for Reset page
 */
interface ResetPageProps { resetInteraction: Reset; }

export const ResetPage: React.FC<ResetPageProps> = observer(({ resetInteraction }) => {
  const targetPageLabel = resetInteraction.targetPage === 'maker' ? 'Maker' : 'Changer';

  return (
    <Inspectable name="ResetPage">
      <Page>
        <div className="reset-page-header">
          <p>Reset <b>{targetPageLabel}</b> page by choosing a new initial word.</p>
        </div>
        <ResetControls resetInteraction={resetInteraction} />
        <ResetWordChoice resetInteraction={resetInteraction} />
      </Page>
    </Inspectable>
  );
});
