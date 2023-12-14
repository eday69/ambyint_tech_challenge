
# Join the Dark Side !
Ambyint Palpatine Exercise

Node version: 18.16.0

### Environment setup:
Copy `.env.sample` as `.env` or create an `.env` file.

`DECRYPT_API_KEY` is a must-have key.

run `npm install`

### To run:
run `npm start`

#### To review results:
Data will be dumped into the `data-output` folder.
Data file name is `citizens-super-secret-info.txt`


### Comments
Challenges/thoughts:
- throttle api calls, needs fine tuning. Better 429 handling.
- all super-secret-data is managed in memory, not ideal is entering huge volumes
- all decryption handled in-memory, also not ideal, same reason
- full load-decryption-planets-file-save is one synchronous call, would hang any other api calls
