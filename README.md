# Fome de Ideia · protótipo funcional

*Bateu a fome. Pintou a ideia.*

React + Vite + TypeScript. Sem backend, login, banco ou IA: tudo roda no navegador.

## Como rodar

```bash
npm install
npm run dev      # abre em http://localhost:5173
npm run build    # gera a pasta dist/
```

## Estrutura

- `src/data/` receitas (arquivos locais) e tipos
- `src/screens/` Início, Receitas, Detalhe, Chat, Salvos
- `src/chat/` camada do chat: `ChatService.ts` (interface) e `demoChatService.ts` (respostas **simuladas**)
- `src/lib/` busca, quantidades, rota por hash e `localStorage` dos salvos
- `public/img/` fotos locais usadas como alternativa quando as URLs do Stitch falham

## Conectar uma IA real

Implemente `ChatService` (ex.: chamando seu backend) e troque a instância em `src/chat/index.ts`.
Não coloque chaves de API no código do navegador.
