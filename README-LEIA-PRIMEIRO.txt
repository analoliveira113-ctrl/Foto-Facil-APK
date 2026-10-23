FOTO FÁCIL — REACT + CAPACITOR + CÂMERA
=======================================

IMPORTANTE
Este ZIP contém o código-fonte completo do aplicativo, mas não contém a pasta
android gerada pelo Android Studio. Ela deve ser criada no seu computador com
os comandos abaixo. É necessário ter Node.js instalado; para compilar o APK,
instale também o Android Studio e o Android SDK.

1) EXTRAIA O ZIP
Extraia a pasta Foto_Facil_React_Capacitor em um local fácil de encontrar.

2) ABRA NO VS CODE
No VS Code, abra a pasta Foto_Facil_React_Capacitor.
Abra Terminal > Novo Terminal e confirme que o terminal está dentro dessa pasta.

3) INSTALE AS DEPENDÊNCIAS
Execute:
npm install

4) GERE A PRIMEIRA VERSÃO WEB
Execute:
npm run build

5) CRIE O PROJETO NATIVO ANDROID
Execute:
npx cap add android

Se o comando informar que a plataforma já existe, não execute novamente.
Continue para o próximo passo.

6) SINCRONIZE O PLUGIN E OS ARQUIVOS
Execute:
npx cap sync android

7) PERMISSÃO DA CÂMERA
Abra:
android/app/src/main/AndroidManifest.xml

Dentro de <manifest> e ANTES de <application>, adicione:
<uses-permission android:name="android.permission.CAMERA" />

Não substitua o arquivo inteiro. Preserve o conteúdo que já existe.
O seletor de fotos moderno do Android normalmente não exige permissões
de armazenamento para selecionar uma imagem.

8) ABRA NO ANDROID STUDIO
Execute:
npx cap open android

Espere a sincronização do Gradle terminar.

9) GERE O APK
No Android Studio, use:
Build > Build Bundle(s) / APK(s) > Build APK(s)

Quando terminar, clique em "locate" na notificação do Android Studio para
encontrar o APK gerado. Instale-o no celular Android para testar.

PARA ALTERAÇÕES FUTURAS
Depois de editar o React, execute:
npm run build
npx cap sync android

Em seguida, gere um APK novo no Android Studio.

COMO TESTAR A ATIVIDADE
- Toque em "Tirar Foto / Galeria".
- Escolha câmera ou galeria no seletor nativo, se apresentado pelo Android.
- Capture/selecione uma imagem e confirme que aparece na tela.
- Abra novamente e cancele/volte; a mensagem de cancelamento deve aparecer.
- O botão deve continuar funcionando.

OBSERVAÇÕES
- O código usa @capacitor/camera e Camera.getPhoto com CameraSource.Prompt.
- O sistema Android pode apresentar uma interface diferente conforme a versão.
- O seletor nativo nem sempre mostra um único diálogo idêntico em todos os
  aparelhos; o comportamento depende da versão do Android e do plugin.
- Teste em um celular Android real para demonstrar o uso da câmera.
