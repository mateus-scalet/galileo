/**
 * Um AudioWorkletProcessor para capturar dados de áudio PCM brutos.
 * Ele recebe o áudio da entrada do microfone e o encaminha para a thread principal
 * através de uma porta de mensagem.
 */
class AudioProcessor extends AudioWorkletProcessor {
  /**
   * O método process é chamado pelo motor de áudio do navegador para cada
   * bloco de dados de áudio.
   * @param {Float32Array[][]} inputs - Um array de entradas, cada uma com um array de canais.
   *                                    Estamos interessados em inputs[0][0] para áudio mono.
   * @returns {boolean} - Retorna true para manter o processador ativo.
   */
  process(inputs) {
    // Esperamos uma única entrada mono.
    const inputChannelData = inputs[0][0];

    // Se houver dados de áudio, envia-os de volta para a thread principal.
    // Enviamos uma cópia do Float32Array para evitar a transferência de propriedade.
    if (inputChannelData) {
      this.port.postMessage(inputChannelData);
    }

    // Deve retornar true para manter o processador em execução.
    return true;
  }
}

// Registra o processador com o nome 'audio-processor'.
// Este nome é usado para instanciar o AudioWorkletNode na thread principal.
registerProcessor('audio-processor', AudioProcessor);
