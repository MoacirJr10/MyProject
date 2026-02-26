### 📸 Galeria do Projeto
Veja como o sistema evoluiu. Abaixo, as telas de monitoramento de CPU, RAM, Disco e Relógio:

<div class='galeria-grid'>
<img src='src/frontend/imagens/esp32S3/esp32s3.jpeg'>
<img src='src/frontend/imagens/esp32S3/esp32s32.jpeg'>
<img src='src/frontend/imagens/esp32S3/esp32s33.jpeg'>
<img src='src/frontend/imagens/esp32S3/esp32s34.jpeg'>
</div>

---

## Opção 1: Versão Clássica (Sem IA)
Esta versão é ideal para quem quer apenas monitorar o hardware (CPU, RAM, Disco) de forma rápida e leve.

### 🐍 Backend Python (V1 - Simples)
```python
import psutil
import time
from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/stats')
def get_stats():
    cpu_cores = psutil.cpu_percent(interval=1, percpu=True)
    ram = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    temp = 0
    try:
        t = psutil.sensors_temperatures()
        if 'coretemp' in t: temp = int(t['coretemp'][0].current)
    except: pass

    return jsonify({
        "hostname": "UBUNTU-SERVER",
        "cpu_cores": cpu_cores,
        "temp": temp,
        "ram_pct": int(ram.percent),
        "ram_used": round(ram.used / (1024**3), 2),
        "ram_total": round(ram.total / (1024**3), 2),
        "disk_pct": int(disk.percent),
        "disk_used": round(disk.used / (1024**3), 1),
        "disk_total": round(disk.total / (1024**3), 1)
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

### 💻 Firmware ESP32 (V1 - 4 Telas)
Este código exibe 4 telas: CPU, RAM, Disco e Relógio. Não tem a tela da IA.

*(O código C++ completo está disponível no repositório do GitHub para economizar espaço aqui)*.

---

## Opção 2: Versão Avançada (Com IA Gemini)
Esta versão adiciona uma camada de inteligência artificial que analisa os dados e gera um resumo em linguagem natural.

### 🔐 Passo a Passo: Configurando a IA com Segurança
Para usar o Gemini, você precisa de uma chave de API (API Key). Siga estes passos para configurar com segurança:

1. Acesse o [Google AI Studio](https://aistudio.google.com/) e crie uma chave gratuita.
2. No seu servidor Ubuntu, instale a biblioteca oficial: `pip install google-genai`.
3. **Segurança Crítica:** Nunca cole sua chave diretamente no código se for compartilhar o arquivo. Use variáveis de ambiente ou um arquivo `.env`.

### 🐍 Backend Python (V2 - Com IA)
```python
import psutil
import time
import os
from google import genai
from flask import Flask, jsonify

app = Flask(__name__)

# --- CONFIGURAÇÃO SEGURA ---
CHAVE_API = os.getenv("GEMINI_API_KEY")

if not CHAVE_API:
    print("ERRO: Chave GEMINI_API_KEY não encontrada!")

client = genai.Client(api_key=CHAVE_API)
MODELO_ATUAL = "gemini-2.0-flash"

# Sistema de Cache para evitar Erro 429
last_ai_response = "Sincronizando com Gemini..."
last_ai_time = 0
AI_COOLDOWN = 120  # 2 minutos

@app.route('/stats')
def get_stats():
    global last_ai_response, last_ai_time

    # Lógica de IA
    current_time = time.time()
    if (current_time - last_ai_time) > AI_COOLDOWN:
        # ... (Chamada ao Gemini) ...
        pass

    return jsonify({
        "gemini_info": last_ai_response
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

### 🛠️ Manutenção do Servidor
Para garantir que seu monitoramento rode 24/7, use estes comandos:

```bash
# Ver se o serviço está rodando
sudo systemctl status esp32_stats.service

# Reiniciar após mudar o código
sudo systemctl restart esp32_stats.service

# Ver logs de erro em tempo real
journalctl -u esp32_stats.service -f
```
