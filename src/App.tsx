import {useCallback, useEffect, useState} from 'react';
import {useGameState} from './hooks/useGameState';
import {Screen, ItemId} from './types/game';
import {apiClient} from './services/api';
import {preloadGameImages} from './services/gameCatalog';
import {HUD} from './components/HUD';
import {CombatScreen} from './components/CombatScreen';
import {EmptyRoomScreen} from './components/EmptyRoomScreen';
import {ChestScreen} from './components/ChestScreen';
import {WrongAnswerDialog} from './components/WrongAnswerDialog';
import {LoginScreen} from './screens/LoginScreen';
import {NewPlayerScreen} from './screens/NewPlayerScreen';
import {ExistingPlayerLoginScreen} from './screens/ExistingPlayerLoginScreen';
import RecoverCodeDialog from './screens/RecoverCodeDialog';
import {PlayerCodeDialog} from './screens/PlayerCodeDialog';
import {MenuScreen} from './screens/MenuScreen';
import {TowerSelectScreen} from './screens/TowerSelectScreen';
import {IntroScreen} from './screens/IntroScreen';
import {SettingsScreen} from './screens/SettingsScreen';
import {StatisticsScreen} from './screens/StatisticsScreen';
import {GameOverScreen} from './screens/GameOverScreen';
import {VictoryScreen} from './screens/VictoryScreen';
import {RewardScreen} from './screens/RewardScreen';
import {FloorCompleteScreen} from './screens/FloorCompleteScreen';
import './App.css';

const GAME_SCREENS = new Set<Screen>([
    Screen.COMBAT, Screen.EMPTY_ROOM, Screen.CHEST,
    Screen.REWARD, Screen.FLOOR_COMPLETE,
]);

function App() {
    const {state, dispatch, actions} = useGameState();
    const showHUD = GAME_SCREENS.has(state.currentScreen);
    const [newPlayerError, setNewPlayerError] = useState<string>('');

    const [isLoaded, setIsLoaded] = useState(false);
    const [preloadError, setPreloadError] = useState<string | null>(null);

    const handleAddTimeUsed = useCallback(() => {
    }, []);

    useEffect(() => {
        let isMounted = true;

        async function initGame() {
            try {
                await preloadGameImages();
                if (isMounted) {
                    setIsLoaded(true);
                }
            } catch (err) {
                console.error('Image preloader failed:', err);
                if (isMounted) {
                    setPreloadError('Nepodařilo se načíst herní data. Zkuste prosím obnovit stránku.');
                }
            }
        }

        initGame();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (state.currentScreen === Screen.VICTORY && state.runId) {
            apiClient.runs.finishRun(state.runId).catch(err => {
                console.error('Failed to mark run as finished:', err);
            });
        }
    }, [state.currentScreen, state.runId]);

    const handleCreateNewPlayer = async (name: string, secretAnimal: string) => {
        setNewPlayerError('');
        try {
            await actions.createNewPlayer(name, secretAnimal);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '';
            if (errorMessage.includes('409')) {
                setNewPlayerError('Toto jméno už někdo používá. Zvol si jiné.');
            } else {
                setNewPlayerError('Chyba při vytváření hráče.');
            }
        }
    };

    if (preloadError) {
        return (
            <div
                className="flex items-center justify-center min-h-screen bg-(--paper-dark) p-2 text-red-500 font-bold text-center">
                <div className="bg-white p-6 rounded-lg border-2 border-red-500 shadow-lg">
                    <p>{preloadError}</p>
                </div>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-(--paper-dark) p-2">
                <div className="text-center font-mono">
                    <h2 className="text-2xl font-bold mb-6 text-(--ink)">Načítání hry...</h2>
                    <div
                        className="w-12 h-12 border-4 border-(--ink) border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-(--paper-dark) p-2">
            <div
                className="graph-paper w-full max-w-6xl h-[92vh] max-h-200 flex flex-col overflow-hidden relative border-2 border-(--ink) shadow-[6px_6px_0_var(--ink)] rounded-[4px_8px_6px_5px/6px_4px_8px_5px]"
            >
                {showHUD && state.selectedTower && (
                    <HUD
                        tower={state.selectedTower}
                        floor={state.floor}
                        room={state.room}
                        playerHp={state.playerHp}
                        playerMaxHp={state.playerMaxHp}
                        onSurrender={() => dispatch({type: 'TO_GAMEOVER'})}
                    />
                )}

                <div className="flex-1 overflow-y-auto flex flex-col">

                    {state.currentScreen === Screen.LOGIN && (
                        <LoginScreen
                            onNewPlayer={() => dispatch({type: 'TO_NEW_PLAYER'})}
                            onExistingPlayer={() => dispatch({type: 'TO_EXISTING_PLAYER_LOGIN'})}
                        />
                    )}

                    {state.currentScreen === Screen.PLAYER_CODE_DIALOG && (
                        <PlayerCodeDialog
                            playerName={state.playerName}
                            playerCode={state.playerCode || ''}
                            onClose={() => dispatch({type: 'PLAYER_CODE_DIALOG_CLOSED'})}
                        />
                    )}

                    {state.currentScreen === Screen.NEW_PLAYER && (
                        <NewPlayerScreen
                            onCheckName={async (name: string) => {
                                try {
                                    await apiClient.players.getStats(name);
                                    setNewPlayerError('Tohle jméno už někdo má. Zkus si vymyslet jiné!');
                                    return false;
                                } catch (err) {
                                    console.log('[Ověření jména] Očekávaná chyba - jméno je volné:', err);
                                    setNewPlayerError('');
                                    return true;
                                }
                            }}
                            onSubmit={handleCreateNewPlayer}
                            onBack={() => {
                                setNewPlayerError('');
                                dispatch({type: 'TO_LOGIN'});
                            }}
                            isLoading={state.isLoading}
                            error={newPlayerError}
                        />
                    )}

                    {state.currentScreen === Screen.EXISTING_PLAYER_LOGIN && (
                        <ExistingPlayerLoginScreen
                            onSubmit={code => actions.loginByCode(code)}
                            onRecovery={() => dispatch({type: 'TO_RECOVER_CODE_DIALOG'})}
                            onBack={() => dispatch({type: 'TO_LOGIN'})}
                            isLoading={state.isLoading}
                            error={state.loginError}
                        />
                    )}

                    {state.currentScreen === Screen.MENU && (
                        <MenuScreen
                            playerName={state.playerName}
                            onPlay={() => dispatch({type: 'TO_TOWER_SELECT'})}
                            onStats={() => dispatch({type: 'TO_STATISTICS'})}
                            onSettings={() => dispatch({type: 'TO_SETTINGS'})}
                            onLogout={() => dispatch({type: 'LOGOUT'})}
                        />
                    )}

                    {state.currentScreen === Screen.TOWER_SELECT && (
                        <TowerSelectScreen
                            onSelect={tower => {
                                dispatch({type: 'SELECT_TOWER', tower});
                                dispatch({type: 'TO_INTRO'});
                            }}
                            onBack={() => dispatch({type: 'TO_MENU'})}
                        />
                    )}

                    {state.currentScreen === Screen.INTRO && state.selectedTower && state.playerName && (
                        <IntroScreen
                            tower={state.selectedTower}
                            playerName={state.playerName}
                            onContinue={() => {
                                actions.startRun();
                            }}
                        />
                    )}

                    {state.currentScreen === Screen.SETTINGS && (
                        <SettingsScreen
                            settings={state.settings}
                            onChange={settings => dispatch({type: 'UPDATE_SETTINGS', settings})}
                            onBack={() => dispatch({type: 'TO_MENU'})}
                        />
                    )}

                    {state.currentScreen === Screen.STATISTICS && (
                        <StatisticsScreen
                            playerName={state.playerName!}
                            onBack={() => dispatch({type: 'TO_MENU'})}
                        />
                    )}

                    {state.currentScreen === Screen.EMPTY_ROOM && (
                        <EmptyRoomScreen
                            rewardItem={state.rewardItem}
                            onRest={() => dispatch({type: 'CAMP_REST'})}
                            onScavenge={() => dispatch({type: 'CAMP_SCAVENGE'})}
                            onTakeReward={() => dispatch({type: 'TAKE_REWARD'})}
                        />
                    )}

                    {state.currentScreen === Screen.CHEST && (
                        <ChestScreen onPick={item => dispatch({type: 'PICK_CHEST_ITEM', item})}/>
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
                            showWrongAnswerDialog={!!state.wrongAnswerDialog}
                            onAnswer={(ans, correct) => {
                                actions.answer(ans ?? '', correct);
                            }}
                            hasRerolledPeek={state.hasRerolledPeek}
                            onUseItem={id => actions.useItem(id as typeof ItemId[keyof typeof ItemId])}
                            onClosePeek={() => dispatch({type: 'CLOSE_PEEK'})}
                            onPeekSkip={() => dispatch({type: 'PEEK_REROLL'})}
                            onAddTimeUsed={handleAddTimeUsed}
                        />
                    )}

                    {state.currentScreen === Screen.REWARD && state.rewardItem && (
                        <RewardScreen
                            item={state.rewardItem}
                            onTake={() => dispatch({type: 'TAKE_REWARD'})}
                            onSkip={() => dispatch({type: 'SKIP_REWARD'})}
                        />
                    )}

                    {state.currentScreen === Screen.FLOOR_COMPLETE && state.selectedTower && (
                        <FloorCompleteScreen
                            tower={state.selectedTower}
                            floor={state.floor}
                            onContinue={() => dispatch({type: 'CONTINUE'})}
                        />
                    )}

                    {state.currentScreen === Screen.GAMEOVER && (
                        <GameOverScreen
                            playerName={state.playerName}
                            floor={state.floor}
                            stats={state.runStats}
                            onReturnToIntro={() => dispatch({type: 'RESTART_TO_INTRO'})}
                            onMenu={() => dispatch({type: 'TO_MENU'})}
                        />
                    )}

                    {state.currentScreen === Screen.VICTORY && state.selectedTower && (
                        <VictoryScreen
                            playerName={state.playerName}
                            towerName={state.selectedTower.name}
                            stats={state.runStats}
                            onMenu={() => dispatch({type: 'TO_MENU'})}
                        />
                    )}
                </div>
            </div>

            {state.wrongAnswerDialog && (
                <WrongAnswerDialog
                    prompt={state.wrongAnswerDialog.prompt}
                    yourAnswer={state.wrongAnswerDialog.yourAnswer}
                    correctAnswers={state.wrongAnswerDialog.correctAnswers}
                    onContinue={() => dispatch({type: 'CLOSE_WRONG_ANSWER_DIALOG'})}
                />
            )}

            {state.showRecoverCodeDialog && (
                <RecoverCodeDialog
                    onClose={() => dispatch({type: 'CLOSE_RECOVER_CODE_DIALOG'})}
                    onRecover={actions.recoverCode}
                />
            )}
        </div>
    );
}

export default App;