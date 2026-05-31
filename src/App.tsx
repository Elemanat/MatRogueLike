import { useCallback } from 'react';
import { useGameState } from './hooks/useGameState';
import { Screen, ItemId } from './types/game';
import { HUD } from './components/HUD';
import { CombatScreen } from './components/CombatScreen';
import { EmptyRoomScreen } from './components/EmptyRoomScreen';
import { ChestScreen } from './components/ChestScreen';
import { WrongAnswerDialog } from './components/WrongAnswerDialog';
import { LoginScreen } from './screens/LoginScreen';
import { MenuScreen } from './screens/MenuScreen';
import { TowerSelectScreen } from './screens/TowerSelectScreen';
import { IntroScreen } from './screens/IntroScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { StatisticsScreen } from './screens/StatisticsScreen';
import { GameOverScreen } from './screens/GameOverScreen';
import { VictoryScreen } from './screens/VictoryScreen';
import { RewardScreen } from './screens/RewardScreen';
import { FloorCompleteScreen } from './screens/FloorCompleteScreen';
import './App.css';

const GAME_SCREENS = new Set<Screen>([
  Screen.COMBAT, Screen.EMPTY_ROOM, Screen.CHEST,
  Screen.REWARD, Screen.FLOOR_COMPLETE,
]);

function App() {
  const { state, dispatch, actions } = useGameState();
  const showHUD = GAME_SCREENS.has(state.currentScreen);

  const handleAddTimeUsed = useCallback(() => {
    // Vizuální feedback je řešen v CombatScreen přes toast
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--paper-dark)' }}>
      <div
        className="graph-paper"
        style={{
          width: 380,
          minHeight: 640,
          maxHeight: '95vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '6px 6px 0 var(--ink)',
          border: '2px solid var(--ink)',
          borderRadius: '4px 8px 6px 5px / 6px 4px 8px 5px',
          position: 'relative',
        }}
      >
        {/* HUD — pouze při herních stavech */}
        {showHUD && state.selectedTower && (
          <HUD
            tower={state.selectedTower}
            floor={state.floor}
            room={state.room}
            playerHp={state.playerHp}
            playerMaxHp={state.playerMaxHp}
          />
        )}

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

          {state.currentScreen === Screen.LOGIN && (
            <LoginScreen onEnter={name => {
              dispatch({ type: 'SET_NAME', name });
              dispatch({ type: 'TO_MENU' });
            }} />
          )}

          {state.currentScreen === Screen.MENU && (
            <MenuScreen
              playerName={state.playerName}
              onPlay={() => dispatch({ type: 'TO_TOWER_SELECT' })}
              onStats={() => dispatch({ type: 'TO_STATISTICS' })}
              onSettings={() => dispatch({ type: 'TO_SETTINGS' })}
              onLogout={() => dispatch({ type: 'LOGOUT' })}
            />
          )}

          {state.currentScreen === Screen.TOWER_SELECT && (
            <TowerSelectScreen
              onSelect={tower => {
                dispatch({ type: 'SELECT_TOWER', tower });
                dispatch({ type: 'TO_INTRO' });
              }}
              onBack={() => dispatch({ type: 'TO_MENU' })}
            />
          )}

          {state.currentScreen === Screen.INTRO && state.selectedTower && (
            <IntroScreen
              tower={state.selectedTower}
              onContinue={() => actions.startRun()}
            />
          )}

          {state.currentScreen === Screen.SETTINGS && (
            <SettingsScreen
              settings={state.settings}
              onChange={settings => dispatch({ type: 'UPDATE_SETTINGS', settings })}
              onResetSessionStats={() => dispatch({ type: 'RESET_SESSION_STATS' })}
              onBack={() => dispatch({ type: 'TO_MENU' })}
            />
          )}

          {state.currentScreen === Screen.STATISTICS && (
            <StatisticsScreen
              playerName={state.playerName!}
              onBack={() => dispatch({ type: 'TO_MENU' })}
            />
          )}

          {state.currentScreen === Screen.EMPTY_ROOM && (
            <EmptyRoomScreen 
              onRest={() => dispatch({ type: 'CAMP_REST' })} 
              onScavenge={() => dispatch({ type: 'CAMP_SCAVENGE' })} 
            />
          )}

          {state.currentScreen === Screen.CHEST && (
            <ChestScreen onPick={item => dispatch({ type: 'PICK_CHEST_ITEM', item })} />
          )}

           {state.currentScreen === Screen.COMBAT && state.currentEnemy && state.currentProblem && (
             <CombatScreen
               key={`${state.currentProblem.id}-${state.currentEnemy.hp}`}
               enemy={state.currentEnemy}
               problem={state.currentProblem}
               playerHp={state.playerHp}
               playerMaxHp={state.playerMaxHp}
               inventory={state.inventory}
               peekNextRoom={state.peekNextRoom}
               roundTimeSeconds={state.settings.roundTimeSeconds}
               reducedMotion={state.settings.reducedMotion}
               showWrongAnswerDialog={!!state.wrongAnswerDialog}
               onAnswer={(ans, correct) => { actions.answer(ans ?? '', correct); }}
               onUseItem={id => dispatch({ type: 'USE_ITEM', itemId: id as typeof ItemId[keyof typeof ItemId] })}
               onClosePeek={() => dispatch({ type: 'CLOSE_PEEK' })}
               onPeekSkip={() => dispatch({ type: 'PEEK_SKIP_ROOM' })}
               onAddTimeUsed={handleAddTimeUsed}
             />
           )}

          {state.currentScreen === Screen.REWARD && state.rewardItem && (
            <RewardScreen
              item={state.rewardItem}
              onTake={() => dispatch({ type: 'TAKE_REWARD' })}
              onSkip={() => dispatch({ type: 'TAKE_REWARD' })}
            />
          )}

          {state.currentScreen === Screen.FLOOR_COMPLETE && state.selectedTower && (
            <FloorCompleteScreen
              tower={state.selectedTower}
              floor={state.floor}
              onContinue={() => dispatch({ type: 'CONTINUE' })}
            />
          )}

          {state.currentScreen === Screen.GAMEOVER && (
            <GameOverScreen
              playerName={state.playerName}
              floor={state.floor}
              stats={state.runStats}
              onReturnToIntro={() => dispatch({ type: 'RESTART_TO_INTRO' })}
              onMenu={() => dispatch({ type: 'TO_MENU' })}
            />
          )}

          {state.currentScreen === Screen.VICTORY && state.selectedTower && (
            <VictoryScreen
              playerName={state.playerName}
              towerName={state.selectedTower.name}
              stats={state.runStats}
              onMenu={() => dispatch({ type: 'TO_MENU' })}
            />
          )}
        </div>
       </div>

       {/* Wrong Answer Dialog Overlay */}
       {state.wrongAnswerDialog && (
         <WrongAnswerDialog
           question={state.wrongAnswerDialog.question}
           yourAnswer={state.wrongAnswerDialog.yourAnswer}
           correctAnswer={state.wrongAnswerDialog.correctAnswer}
           onContinue={() => dispatch({ type: 'CLOSE_WRONG_ANSWER_DIALOG' })}
         />
       )}
     </div>
  );
}

export default App;
