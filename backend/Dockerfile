# Usa uma imagem leve do Node.js
FROM node:18-alpine

# Cria diretório de trabalho
WORKDIR /app

# Copia arquivos de dependências
COPY package*.json ./

# Instala dependências
RUN npm install --production

# Copia o resto do código
COPY . .

# Expõe a porta 3000
EXPOSE 3000

# Comando para iniciar
CMD ["node", "server.js"]
