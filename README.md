# supply-info-api for Cosmos

This is an advanced supply information API for Cosmos Chain.
I simplified the logic structure to improve efficiency and enable automatic switching in case of API_ENDPOINT failure. 

This improves the reliability and stability of the supply information API by quickly switching to the next API_ENDPOINT when the first one fails.


```json
{
  "apr": 68.31957987369881,
  "totalSupply": 11997255843.06718,
  "circulatingSupply": 11296519548.811697,
  "communityPool": 700723521.8232318,
  "totalStaked": "6146166417.423682",
  "bondedRatio": 0.5122982322886627,
  "denom": "MEME",
  "version": "MEME API v1.3, JK Labs : https://3jk.net"
}
```



## Other routes

－ `/v1/total-supply`: returns total supply in plain text
－ `/v1/circulating-supply`: returns circulating supply in plain text
－ `/v1/total-staked`: returns total staked in plain text
－ `/v1/bonded-ratio`: returns bonded ratio in plain text
－ `/v1/community-pool`: returns community pool size in plain text
－ `/v1/apr`: returns APR in plain text
－ `/v1/denom`: returns denom in plain text
－ `/v1`: JSON


### How circulating supply is calculated

1. Get total supply.
2. Get community pool.
3. Subtract community pool from total supply.

This yields the circulating supply.

## environment variable

See `.env.example` for an example.

eg:

INTERVAL=120000 # if INTERVAL = 60000 = 60s cache, 
PORT=3010
API_ENDPOINT1=https://meme-api.polkachu.com
API_ENDPOINT2=https://api-meme-1.meme.sx
API_ENDPOINT3=https://meme.api.m.anode.team
COIN_DENOM=umeme
COIN_DECIMALS=6
DENOM=MEME



## JK Labs
https://3jk.net


