
import React, { useEffect, useState } from 'react';
import {
  Camera,
  CameraResultType,
  CameraSource
} from '@capacitor/camera';
import './style.css';

export default function PontoEletronicoApp() {
  const [fotoSelfie, setFotoSelfie] = useState(null);
  const [registros, setRegistros] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    try {
      const salvos = JSON.parse(
        localStorage.getItem('registrosPonto') || '[]'
      );
      setRegistros(salvos);
    } catch {
      setRegistros([]);
    }
  }, []);

  const registrarPonto = async () => {
    setCarregando(true);
    setMensagem('');
    setFotoSelfie(null);

    try {
      // Verifica a permissão de câmera no Android.
      let permissoes = await Camera.checkPermissions();

      if (permissoes.camera !== 'granted') {
        permissoes = await Camera.requestPermissions({
          permissions: ['camera']
        });
      }

      if (permissoes.camera !== 'granted') {
        setMensagem(
          'Permita o acesso à câmera para registrar seu ponto.'
        );
        return;
      }

      // Captura uma selfie diretamente pela câmera.
      const foto = await Camera.getPhoto({
        quality: 70,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });

      if (!foto.webPath) {
        setMensagem('Não foi possível obter a selfie.');
        return;
      }

      // Só registra o horário depois de obter a selfie.
      const agora = new Date();

      const registro = {
        id: `${agora.getTime()}`,
        data: agora.toLocaleDateString('pt-BR'),
        horario: agora.toLocaleTimeString('pt-BR'),
        foto: foto.webPath
      };

      const atualizados = [registro, ...registros];

      setFotoSelfie(foto.webPath);
      setRegistros(atualizados);

      // Guarda o histórico do ponto no armazenamento local.
      // A foto exibida usa webPath e não é salva permanentemente aqui.
      const historico = atualizados.map(
        ({ id, data, horario }) => ({ id, data, horario })
      );

      localStorage.setItem(
        'registrosPonto',
        JSON.stringify(historico)
      );

      setMensagem('Ponto registrado com sucesso!');
    } catch (erro) {
      console.error('Erro ao registrar ponto:', erro);

      setMensagem(
        'A captura foi cancelada ou não foi possível abrir a câmera. Nenhum ponto foi registrado.'
      );
    } finally {
      setCarregando(false);
    }
  };

  const limparHistorico = () => {
    setRegistros([]);
    localStorage.removeItem('registrosPonto');
    setMensagem('Histórico removido deste dispositivo.');
  };

  return (
    <main className="app">
      <header className="topo">
        <div className="marca">
          <div className="marca-icone">PE</div>
          <div>
            <h1>Ponto<span>Fácil</span></h1>
            <p>PONTO ELETRÔNICO MOBILE</p>
          </div>
        </div>
        <span className="status">PRESENCIAL</span>
      </header>

      <section className="boas-vindas">
        <p className="etiqueta">CONTROLE DE JORNADA</p>
        <h2>Seu trabalho.<br />Seu registro.</h2>
        <p className="descricao">
          Faça sua selfie para confirmar a marcação do ponto
          presencial.
        </p>
      </section>

      <section className="cartao-ponto">
        <div className="cartao-titulo">
          <div>
            <span className="subtitulo">MARCAÇÃO DE PONTO</span>
            <h3>Registrar agora</h3>
          </div>
          <div className="icone-camera">📸</div>
        </div>

        <div className="area-selfie">
          {fotoSelfie ? (
            <img
              className="foto-selfie"
              src={fotoSelfie}
              alt="Selfie do registro de ponto"
            />
          ) : (
            <div className="selfie-vazia">
              <div className="silhueta">👤</div>
              <p>Sua selfie aparecerá aqui</p>
              <span>Posicione-se em frente à câmera</span>
            </div>
          )}
        </div>

        <div className="aviso">
          <span>i</span>
          <p>
            A câmera será aberta para tirar uma nova selfie.
            A galeria não será usada.
          </p>
        </div>

        <button
          className="botao-registrar"
          onClick={registrarPonto}
          disabled={carregando}
        >
          {carregando ? (
            'Aguardando câmera...'
          ) : (
            <>
              <span>📷</span> Registrar ponto com selfie
            </>
          )}
        </button>

        {mensagem && (
          <p
            className="mensagem"
            role="status"
            aria-live="polite"
          >
            {mensagem}
          </p>
        )}

        <p className="nota">
          O horário só é registrado depois que a selfie é capturada.
        </p>
      </section>

      <section className="historico">
        <div className="historico-cabecalho">
          <div>
            <span className="subtitulo">ACOMPANHAMENTO</span>
            <h3>Histórico de pontos</h3>
          </div>
          <span className="contador">{registros.length}</span>
        </div>

        {registros.length === 0 ? (
          <div className="historico-vazio">
            <span>🕒</span>
            <p>Nenhum ponto registrado ainda.</p>
          </div>
        ) : (
          <div className="lista-registros">
            {registros.map((registro) => (
              <article className="registro" key={registro.id}>
                <div className="registro-icone">✓</div>
                <div className="registro-info">
                  <strong>Ponto presencial</strong>
                  <span>{registro.data}</span>
                </div>
                <time>{registro.horario}</time>
              </article>
            ))}
          </div>
        )}

        {registros.length > 0 && (
          <button
            className="botao-limpar"
            onClick={limparHistorico}
          >
            Limpar histórico deste dispositivo
          </button>
        )}
      </section>

      <footer>
        <span> PontoFácil </span>
        <p>Protótipo acadêmico de ponto eletrônico</p>
      </footer>
    </main>
  );
}
