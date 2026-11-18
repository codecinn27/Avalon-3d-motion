# Plan
This version only use taste skill does not include cook skills.

- [x] 1. find a references at least 5

- https://ellioteriksson.com/
 -> use the 7 cards to move like this 

 - https://www.davidecarusio.it/en
 -> motion like this 

 - https://premotio.com/
 -> 7 cards transition to a new table with this 

- [x] 2. list out the prompt and all the feature you want
- [x] 3. use cook skill or taste skill to do 
- [x] 4. create the initial design first 



# Evaluation for story line

Overall score (1-10):
Having each category: 
- let AI to score until it reach 9.5 before proceed to build
1. Story concept 
2. Immersion potential
3. Avalon rule accuracy
4. Visitor engagement
5. Conversion to actual gameplay 


# How to run this :
1. npm install (for the first build only in the new computer)
2. npm run build (will write minified site into dist/; also trims the music with ffmpeg, so ffmpeg must be on PATH or set FFMPEG_PATH)
3. npx http-server dist -p 4321 -c-1
4. npm run build:dev + npx serve dist
 (readable without minifying, for debugging)

# Deployment:
CLoudflare -> build first then drag the dist/ in .zip format
https://curly-bread-97ec.codecinnpro.workers.dev/


# Verify 
## Share link: 
- [x] Facebook
- [x] Whatsapp
- [x] Threads
- [x] save Photo

# Daily logs:
## 17/11/2026

1. ✔ Fix fb share link 
- The text may not appear. Facebook has been phasing out pre-filled text, so it may ignore quote and show an empty box. The picture and link will still appear. (verify through gemini)

2. ✔ fix music not closable
3. ✔ Fix character number tags not viewable when "Good wins" or "Evil wins" is visible
4. ✔ add music licensing
- original music: https://music.youtube.com/watch?v=7_cwKd81z7Q&si=nfrZRoa5z9jrOlyK&drli=1
- Credit attribute text: (from: https://creatorchords.com/music/adventure/)
```
Music: Adventure by Alexander Nakarada (https://creatorchords.com)
Licensed under Creative Commons Attribution 4.0 International (CC BY 4.0)
https://creativecommons.org/licenses/by/4.0/
```

5. ✔ remove this text invite my group 

6. fix mobile scrolling super lag issue 
- desktop no issue
- dekstop with inspect with mobile screen no issue

4. review all message in english
5. review all message in chinese
6. review all message in malay
7. research on how to work with shinjuru cpanel + cloudflare for hosting 

Future: 
1. 


# To get from the user:
1. what to post on the dns (what domain name do your want)
2. what message do you want to post in whatsapp ? 
3. provide me your social link that you want 
- thread, ig , fb ,google maps ,website link 
4. what message do you want me to change instead 
5. get phone number for whatsapp and test the button



# Debugging with phone:
step 1: 
```bash
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"; & $adb devices -l; & $adb forward tcp:9333 localabstract:chrome_devtools_remote; & $adb forward --list; try { (Invoke-WebRequest -UseBasicParsing http://127.0.0.1:9333/json/version -TimeoutSec 5).Content } catch { "Chrome on the phone not reachable: $($_.Exception.Message)" }
```

step 2: 
```bash
npm run build
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" reverse tcp:4870 tcp:4870
npx serve dist -l 4870
```

step 3: open http://localhost:4870 at the phone