/**
 * Storage.js
 * Gerenciador de armazenamento local para persistência de High Score.
 */

const HIGH_SCORE_KEY = 'chrome_dino_motion_hi_score';

export class Storage {
  static getHighScore() {
    try {
      const val = localStorage.getItem(HIGH_SCORE_KEY);
      return val ? parseInt(val, 10) : 0;
    } catch (e) {
      console.warn('Não foi possível acessar localStorage:', e);
      return 0;
    }
  }

  static saveHighScore(score) {
    try {
      const currentHi = Storage.getHighScore();
      if (score > currentHi) {
        localStorage.setItem(HIGH_SCORE_KEY, score.toString());
        return true; // Novo recorde atingido
      }
    } catch (e) {
      console.warn('Erro ao salvar no localStorage:', e);
    }
    return false;
  }
}
