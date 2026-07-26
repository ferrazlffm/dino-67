import { createClient } from '@supabase/supabase-js';

// Obter variáveis de ambiente da Vite ou utilizar fallback
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabase = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('[Supabase] Cliente inicializado com a URL:', SUPABASE_URL);
  } catch (err) {
    console.warn('[Supabase] Erro ao inicializar cliente:', err);
  }
} else {
  console.warn('[Supabase] AVISO: VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não foram encontradas durante o build! Usando fallback localStorage.');
}

const LOCAL_STORAGE_RANKING_KEY = 'dino67_ranking_top5';

/**
 * Recupa o ranking local salvo em localStorage (Fallback)
 */
function getLocalRanking() {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_RANKING_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Salva o ranking local em localStorage (Fallback)
 */
function saveLocalRanking(ranking) {
  try {
    localStorage.setItem(LOCAL_STORAGE_RANKING_KEY, JSON.stringify(ranking));
  } catch (e) {
    console.error('Erro ao salvar ranking local', e);
  }
}

export const rankingService = {
  /**
   * Verifica se o Supabase está configurado ativamente
   */
  isConfigured() {
    return !!supabase;
  },

  /**
   * Busca os 5 maiores pontuadores
   * @returns {Promise<Array<{id: string, player_name: string, score: number, created_at: string}>>}
   */
  async getTopScores() {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('ranking')
          .select('id, player_name, score, created_at')
          .order('score', { ascending: false })
          .limit(5);

        if (!error && data) {
          return data;
        }
        console.warn('[Supabase] Erro ao consultar ranking:', error);
      } catch (err) {
        console.error('[Supabase] Falha de conexão:', err);
      }
    }

    // Fallback para LocalStorage se o Supabase não responder ou não estiver configurado
    const local = getLocalRanking();
    return local.sort((a, b) => b.score - a.score).slice(0, 5);
  },

  /**
   * Verifica se a pontuação obtida qualifica o jogador para entrar no Top 5
   * @param {number} score 
   * @returns {Promise<boolean>}
   */
  async isTopScore(score) {
    if (score <= 0) return false;
    const topScores = await this.getTopScores();
    if (topScores.length < 5) return true;
    const lowestScore = topScores[topScores.length - 1].score;
    return score > lowestScore;
  },

  /**
   * Envia uma nova pontuação com o nome do jogador (até 10 caracteres)
   * @param {string} playerName 
   * @param {number} score 
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async submitScore(playerName, score) {
    const sanitizedName = (playerName || 'ANÔNIMO').trim().substring(0, 10).toUpperCase();
    const finalScore = Math.floor(score);

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('ranking')
          .insert([
            { player_name: sanitizedName, score: finalScore }
          ])
          .select();

        if (!error) {
          return { success: true, data };
        }
        console.warn('[Supabase] Erro ao salvar pontuação:', error);
      } catch (err) {
        console.error('[Supabase] Falha ao enviar pontuação:', err);
      }
    }

    // Fallback LocalStorage
    const local = getLocalRanking();
    local.push({
      id: 'local_' + Date.now(),
      player_name: sanitizedName,
      score: finalScore,
      created_at: new Date().toISOString()
    });
    const updated = local.sort((a, b) => b.score - a.score).slice(0, 5);
    saveLocalRanking(updated);

    return { success: true, fallback: true };
  }
};
