/**
 * PlayerStats.js
 * Gerenciador de estatísticas do jogador salvas em LocalStorage.
 */

const STATS_KEY = 'dino67_stats_v1';

export class PlayerStats {
  static getStats() {
    try {
      const data = localStorage.getItem(STATS_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Erro ao ler estatísticas:', e);
    }

    return {
      totalGames: 0,
      totalScore: 0,
      highestPhase: 1,
      maxJumpsSequence: 0
    };
  }

  static recordGameOver(finalScore, phaseNumber, jumpsInSession) {
    const stats = this.getStats();

    stats.totalGames += 1;
    stats.totalScore += Math.floor(finalScore);
    if (phaseNumber > stats.highestPhase) {
      stats.highestPhase = phaseNumber;
    }
    if (jumpsInSession > stats.maxJumpsSequence) {
      stats.maxJumpsSequence = jumpsInSession;
    }

    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (e) {
      console.warn('Erro ao salvar estatísticas:', e);
    }

    return stats;
  }

  static getAverageScore() {
    const stats = this.getStats();
    if (stats.totalGames === 0) return 0;
    return Math.floor(stats.totalScore / stats.totalGames);
  }
}
