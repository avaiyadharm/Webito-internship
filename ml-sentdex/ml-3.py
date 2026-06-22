import yfinance as yf
import math
df = yf.download("GOOGL", start="2024-01-01", end="2025-01-01")
df = df[['Close', 'High', 'Low', 'Open', 'Volume']]
df['HL_PCT'] = (df['High'] - df['Close']) / df['Low'] * 100.0
df['PCT_change'] = (df['Close'] - df['Open']) / df['Open'] * 100.0

df = df[['Close', 'HL_PCT', 'PCT_change', 'Volume']]


forecast_col = 'Close'
df.fillna(-99999, inplace=True)

forecast_out = int(math.ceil(0.01 * len(df)))
df['label'] = df[forecast_col].shift(-forecast_out)
df.dropna(inplace=True)

print(df.head())

