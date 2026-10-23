import { useState } from 'react';
import {
  Camera,
  CameraResultType,
  CameraSource
} from '@capacitor/camera';
import './style.css';

export default function App() {
  const [foto, setFoto] = useState(null);
  const [mensagem, setMensagem] = useState(
    'Sua próxima foto aparecerá aqui.'
  );
  const [carregando, setCarregando] = useState(false);

  async function abrirCamera() {
    setCarregando(true);

    try {
      // Verifica se o aplicativo tem permissão para usar a câmera.
      const permissoes = await Camera.checkPermissions();

      if (permissoes.camera !== 'granted') {
        const resultado = await Camera.requestPermissions({
          permissions: ['camera']
        });

        if (resultado.camera !== 'granted') {
          setMensagem(
            'Permissão de câmera não concedida. Você pode tentar novamente.'
          );
          return;
        }
      }

      setMensagem('Abrindo as opções de foto...');

      // O Android apresenta a opção de câmera ou galeria.
      const imagem = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt,
        promptLabelHeader: 'Escolha uma opção',
        promptLabelPhoto: 'Abrir galeria',
        promptLabelPicture: 'Tirar foto',
        promptLabelCancel: 'Cancelar'
      });

      if (imagem.webPath) {
        setFoto(imagem.webPath);
        setMensagem('Foto carregada com sucesso!');
      } else {
        setMensagem('Não foi possível exibir a imagem.');
      }
    } catch (erro) {
      // Cancelar a câmera/galeria pode rejeitar a Promise.
      console.log('Captura cancelada ou não concluída:', erro);
      setMensagem(
        'Operação cancelada. Tudo certo! Você pode tentar novamente.'
      );
    } finally {
      setCarregando(false);
    }
  }

  function limparFoto() {
    setFoto(null);
    setMensagem('Sua próxima foto aparecerá aqui.');
  }

  return (
    <main className="pagina">
      <section className="cartao">
        <div className="icone-camera" aria-hidden="true">📸</div>
        <p className="etiqueta">MEU PRIMEIRO APP NATIVO</p>
        <h1>Foto Fácil</h1>
        <p className="descricao">
          Tire uma foto ou escolha uma imagem da sua galeria.
          Sua imagem aparecerá aqui na mesma hora!
        </p>

        <button
          className="botao-principal"
          onClick={abrirCamera}
          disabled={carregando}
        >
          {carregando ? 'Aguarde...' : '📷 Tirar Foto / Galeria'}
        </button>

        <div className="area-foto">
          {foto ? (
            <img
              src={foto}
              alt="Foto capturada ou selecionada"
              className="foto-preview"
            />
          ) : (
            <div className="foto-vazia">
              <span className="icone-vazio" aria-hidden="true">▧</span>
              <p>Nenhuma foto selecionada</p>
              <small>Sua pré-visualização aparecerá aqui</small>
            </div>
          )}
        </div>

        <p className="mensagem" role="status" aria-live="polite">
          {mensagem}
        </p>

        {foto && (
          <button className="botao-secundario" onClick={limparFoto}>
            Remover foto
          </button>
        )}

        <div className="rodape">
          <span>REACT</span><span>•</span><span>CAPACITOR</span>
          <span>•</span><span>ANDROID</span>
        </div>
      </section>
    </main>
  );
}