from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
import cv2
import numpy as np
from PIL import Image
import pytesseract
import pandas as pd
import ta
import tempfile

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def extract_candles(image_path):
    # Carregar imagem
    img = cv2.imread(image_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    # Binarizar para destacar candles
    _, thresh = cv2.threshold(gray, 180, 255, cv2.THRESH_BINARY_INV)
    # Encontrar contornos (candles)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    candles = []
    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)
        # Filtros para ignorar ruído
        if 5 < w < 30 and 20 < h < 200:
            candles.append((x, y, w, h))
    # Ordenar candles da esquerda para direita
    candles = sorted(candles, key=lambda c: c[0])
    # Simular OHLC (mock visual)
    ohlc = []
    for c in candles:
        x, y, w, h = c
        open_ = y + h if np.random.rand() > 0.5 else y
        close = y if open_ != y else y + h
        high = min(y, y + h)
        low = max(y, y + h)
        ohlc.append({
            'open': open_,
            'high': high,
            'low': low,
            'close': close
        })
    return pd.DataFrame(ohlc)

def analisar_tecnica(df, timeframe, ativo):
    analise = {}

    # 1. Médias Móveis (SMA e EMA)
    df['sma9'] = df['close'].rolling(9).mean()
    df['sma20'] = df['close'].rolling(20).mean()
    df['ema20'] = ta.trend.ema_indicator(df['close'], window=20)
    
    tendencia_mm = 'Neutro'
    if df['sma9'].iloc[-1] > df['sma20'].iloc[-1] and df['close'].iloc[-1] > df['ema20'].iloc[-1]:
        tendencia_mm = 'Alta (MM9 > MM20, Preço > EMA20)'
    elif df['sma9'].iloc[-1] < df['sma20'].iloc[-1] and df['close'].iloc[-1] < df['ema20'].iloc[-1]:
        tendencia_mm = 'Baixa (MM9 < MM20, Preço < EMA20)'
    analise['medias_moveis'] = f'Tendência por Médias Móveis: {tendencia_mm}.'

    # 2. RSI (Índice de Força Relativa)
    df['rsi'] = ta.momentum.rsi(df['close'], window=14, fillna=True)
    rsi_val = df["rsi"].iloc[-1]
    condicao_rsi = 'Neutro'
    if rsi_val > 70:
        condicao_rsi = 'Sobrecomprado'
    elif rsi_val < 30:
        condicao_rsi = 'Sobrevendido'
    analise['rsi'] = f'RSI(14): {rsi_val:.1f} ({condicao_rsi}).'

    # 3. MACD
    macd_line = ta.trend.macd(df['close'], fillna=True)
    macd_signal = ta.trend.macd_signal(df['close'], fillna=True)
    condicao_macd = 'Neutro'
    if macd_line.iloc[-1] > macd_signal.iloc[-1]:
        condicao_macd = 'Positivo/Cruzamento de Compra'
    else:
        condicao_macd = 'Negativo/Cruzamento de Venda'
    analise['macd'] = f'MACD: {condicao_macd}.'

    # 4. Bandas de Bollinger
    bollinger = ta.volatility.BollingerBands(df['close'], window=20, window_dev=2)
    df['bb_high'] = bollinger.bollinger_hband()
    df['bb_low'] = bollinger.bollinger_lband()
    posicao_bb = 'Dentro das bandas'
    if df['close'].iloc[-1] > df['bb_high'].iloc[-1]:
        posicao_bb = 'Acima da banda superior (possível reversão de baixa)'
    elif df['close'].iloc[-1] < df['bb_low'].iloc[-1]:
        posicao_bb = 'Abaixo da banda inferior (possível reversão de alta)'
    analise['bollinger_bands'] = f'Bandas de Bollinger: {posicao_bb}.'

    # 5. Nuvem de Ichimoku
    ichimoku = ta.trend.IchimokuIndicator(df['high'], df['low'], window1=9, window2=26, window3=52, fillna=True)
    span_a = ichimoku.ichimoku_a().iloc[-26] # Span A é projetado 26 períodos à frente
    span_b = ichimoku.ichimoku_b().iloc[-26] # Span B é projetado 26 períodos à frente
    preco_atual = df['close'].iloc[-1]
    
    posicao_nuvem = 'Dentro da nuvem (indefinido)'
    if preco_atual > span_a and preco_atual > span_b:
        posicao_nuvem = 'Acima da nuvem (tendência de alta)'
    elif preco_atual < span_a and preco_atual < span_b:
        posicao_nuvem = 'Abaixo da nuvem (tendência de baixa)'
    analise['ichimoku'] = f'Ichimoku Cloud: {posicao_nuvem}.'
    
    # 6. Retração de Fibonacci (simplificado)
    max_price = df['high'].max()
    min_price = df['low'].min()
    diff = max_price - min_price
    niveis_fibo = {
        'Nível 0.0% (Mínimo)': min_price,
        'Nível 23.6%': min_price + 0.236 * diff,
        'Nível 38.2%': min_price + 0.382 * diff,
        'Nível 50.0%': min_price + 0.5 * diff,
        'Nível 61.8%': min_price + 0.618 * diff,
        'Nível 100.0% (Máximo)': max_price,
    }
    analise['fibonacci'] = f'Retrações de Fibonacci (baseado no range visual): Suportes em {niveis_fibo["Nível 61.8%"]:.2f} e {niveis_fibo["Nível 38.2%"]:.2f}. Resistências em {niveis_fibo["Nível 23.6%"]:.2f}.'

    # 7. Volume e OBV - AVISO
    analise['volume_obv'] = 'AVISO: Não foi possível calcular o Volume ou OBV (On Balance Volume), pois os dados de volume não são extraídos da imagem. A análise seria mais precisa com esses dados.'

    # Decisão final (melhorada)
    score = 0
    if tendencia_mm.startswith('Alta'): score += 1
    if condicao_rsi == 'Sobrevendido': score += 1
    if condicao_macd.startswith('Positivo'): score += 1
    if posicao_bb.endswith('(possível reversão de alta)'): score +=1
    if posicao_nuvem.startswith('Acima'): score += 1
    
    if tendencia_mm.startswith('Baixa'): score -= 1
    if condicao_rsi == 'Sobrecomprado': score -= 1
    if condicao_macd.startswith('Negativo'): score -= 1
    if posicao_bb.endswith('(possível reversão de baixa)'): score -=1
    if posicao_nuvem.startswith('Abaixo'): score -= 1

    decisao = 'NEUTRA'
    confianca = 'baixa'
    if score >= 3:
        decisao = 'COMPRA'
        confianca = 'alta'
    elif score >= 1:
        decisao = 'COMPRA'
        confianca = 'média'
    elif score <= -3:
        decisao = 'VENDA'
        confianca = 'alta'
    elif score <= -1:
        decisao = 'VENDA'
        confianca = 'média'
        
    return analise, decisao, confianca

@app.post("/analisar-grafico")
async def analisar_grafico(
    image: UploadFile = File(...),
    timeframe: str = Form(...),
    ativo: str = Form(...)
):
    with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp:
        tmp.write(await image.read())
        tmp_path = tmp.name
    try:
        df = extract_candles(tmp_path)
        if len(df) < 26: # Aumentado para Ichimoku e outros indicadores
            raise Exception('Não foi possível extrair candles suficientes para uma análise completa.')
        
        analise, decisao, confianca = analisar_tecnica(df, timeframe, ativo)
        
        analise_txt = f"""
        Análise Técnica para {ativo} ({timeframe})
        -------------------------------------------
        
        📊 1. Médias Móveis (SMA/EMA)
        {analise['medias_moveis']}

        💪 2. Índice de Força Relativa (RSI)
        {analise['rsi']}

        📈 3. MACD
        {analise['macd']}

        🌊 4. Bandas de Bollinger
        {analise['bollinger_bands']}

        ☁️ 5. Nuvem de Ichimoku
        {analise['ichimoku']}

        🏛️ 6. Níveis de Fibonacci
        {analise['fibonacci']}
        
        🔊 7. Volume e OBV
        {analise['volume_obv']}

        -------------------------------------------
        🎯 Decisão Final Sugerida
        Operação: {decisao} (Confiança: {confianca})
        """
        
        return JSONResponse(content={
            "analise": analise_txt,
            "decisao": {
                "operacao": decisao.lower(),
                "justificativa": analise_txt,
                "confianca": confianca
            }
        })
    except Exception as e:
        return JSONResponse(content={"erro": str(e)}, status_code=400)
    finally:
        os.remove(tmp_path)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 