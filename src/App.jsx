
import React, { useEffect, useState } from 'react';
import {
  Camera,
  CameraResultType,
  CameraSource
} from '@capacitor/camera';
import { supabase } from './services/supabase';
import './style.css';

const BUCKET = 'fotos-ponto';

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
    setMensagem('Iniciando registro...');
    setCarregando(true);
    setMensagem('');
    setFotoSelfie(null);

    try {
      let permissoes = await Camera.checkPermissions();

      if (permissoes.camera !== 'granted') {
        permissoes = await Camera.requestPermissions({
          permissions: ['camera']
        });
      }

      if (permissoes.camera !== 'granted') {
        setMensagem('Permita o acesso à câmera para continuar.');
        return;
      }

      // 1. Capturar a selfie pela câmera nativa.
      const foto = await Camera.getPhoto({
        
        quality: 70,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });
      setMensagem('Selfie capturada. Preparando envio...');

      if (!foto.webPath) {
        throw new Error('A câmera não retornou a imagem.');
      }

      setMensagem('Enviando selfie para a nuvem...');

      // 2. Converter a imagem em Blob.
      const resposta = await fetch(foto.webPath);
      const blob = await resposta.blob();

      // 3. Criar um nome único para o arquivo.
      const nomeArquivo = `selfie-${Date.now()}.jpg`;

      // 4. Enviar a imagem para o Supabase Storage.
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .upload(nomeArquivo, blob, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // 5. Obter a URL pública da imagem enviada.
      const { data: dadosUrl } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(data.path);

      const urlPublica = dadosUrl.publicUrl;

      // 6. Só registrar o ponto após o upload bem-sucedido.
      const agora = new Date();

      const registro = {
        id: String(agora.getTime()),
        data: agora.toLocaleDateString('pt-BR'),
        horario: agora.toLocaleTimeString('pt-BR'),
        fotoUrl: urlPublica,
        caminhoArquivo: data.path
      };

      const atualizados = [registro, ...registros];

      setFotoSelfie(urlPublica);
      setRegistros(atualizados);

      // Guardar os dados do histórico no dispositivo.
      localStorage.setItem(
        'registrosPonto',
        JSON.stringify(atualizados)
      );

      setMensagem('Selfie enviada e ponto registrado com sucesso!');
    } catch (erro) {
  console.error('Erro ao registrar ponto:', erro);

  setMensagem(
    erro?.message
      ? `Não foi possível registrar o ponto: ${erro.message}`
      : 'Captura cancelada ou erro no envio. Nenhum ponto foi registrado.'
  );
}finally {
      setCarregando(false);
    }
  };

  const limparHistorico = () => {
    setRegistros([]);
    localStorage.removeItem('registrosPonto');
    setMensagem('Histórico local removido. As imagens na nuvem não foram apagadas.');
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
          Faça sua selfie para confirmar a marcação do ponto presencial.
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
              <span>A imagem será enviada para a nuvem</span>
            </div>
          )}
        </div>

        <div className="aviso">
          <span>i</span>
          <p>
            A selfie é capturada pela câmera e enviada ao Supabase Storage.
          </p>
        </div>

        <button
          className="botao-registrar"
          onClick={registrarPonto}
          disabled={carregando}
        >
          {carregando
            ? 'Processando selfie...'
            : '📷 Registrar ponto com selfie'}
        </button>

        {mensagem && (
          <p className="mensagem" role="status" aria-live="polite">
            {mensagem}
          </p>
        )}

        <p className="nota">
          O registro só é concluído depois que o envio da selfie dá certo.
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
                  <a
                    href={registro.fotoUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ver selfie na nuvem
                  </a>
                </div>
                <time>{registro.horario}</time>
              </article>
            ))}
          </div>
        )}

        {registros.length > 0 && (
          <button className="botao-limpar" onClick={limparHistorico}>
            Limpar histórico deste dispositivo
          </button>
        )}
      </section>

      <footer>
        <span>PontoFácil</span>
        <p>Protótipo acadêmico de ponto eletrônico</p>
      </footer>
    </main>
  );
}
