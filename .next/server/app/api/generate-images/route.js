"use strict";(()=>{var e={};e.id=7380,e.ids=[7380],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},4272:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>A,patchFetch:()=>v,requestAsyncStorage:()=>y,routeModule:()=>f,serverHooks:()=>w,staticGenerationAsyncStorage:()=>x});var i={};r.r(i),r.d(i,{GET:()=>h,POST:()=>p});var a=r(9303),o=r(8716),s=r(670),n=r(7070),l=r(1258);let c=()=>{let e=[process.env.GEMINI_API_KEY,process.env.GOOGLE_AI_API_KEY,process.env.VERTEX_AI_API_KEY].filter(Boolean);if(0===e.length)throw Error("GEMINI_API_KEY, GOOGLE_AI_API_KEY, 또는 VERTEX_AI_API_KEY 환경 변수가 설정되지 않았습니다.");return e[0]},d={animagine31:{style:"anime illustration, Japanese animation style, vibrant colors, detailed artwork",mood:"energetic, dynamic, anime aesthetic"},chibitoon:{style:"chibi cartoon style, cute characters, simplified features, playful",mood:"adorable, friendly, whimsical"},"enna-sketch-style":{style:"pencil sketch, hand-drawn, artistic, monochrome with touches of color",mood:"artistic, creative, thoughtful"},"flux-schnell-dark":{style:"dark theme, dramatic lighting, high contrast, moody atmosphere",mood:"mysterious, intense, dramatic"},"flux-schnell-realitic":{style:"photorealistic, high resolution, professional photography, detailed",mood:"authentic, professional, lifelike"},"flux-schnell-webtoon":{style:"webtoon manhwa style, clean lines, digital art, Korean comic aesthetic",mood:"modern, engaging, colorful"},"flux-dark":{style:"dark theme, dramatic lighting, high contrast, moody atmosphere",mood:"mysterious, intense, dramatic"},"flux-realistic":{style:"photorealistic, high resolution, professional photography, detailed",mood:"authentic, professional, lifelike"},"flux-webtoon":{style:"webtoon manhwa style, clean lines, digital art, Korean comic aesthetic",mood:"modern, engaging, colorful"}};class g{constructor(e){let t=e||c();this.genAI=new l.$D(t),this.maxRetries=3,this.baseDelay=1e3,this.qualityThreshold=60,this.model=this.genAI.getGenerativeModel({model:"gemini-2.0-flash-exp",generationConfig:{temperature:.8,topK:32,topP:.92,maxOutputTokens:4096,candidateCount:1}})}setProgressCallback(e){this.progressCallback=e}updateProgress(e,t){this.progressCallback&&this.progressCallback(e,t),console.log(`🔄 ${e}${void 0!==t?` (${t}%)`:""}`)}async sleep(e){return new Promise(t=>setTimeout(t,e))}async retryWithExponentialBackoff(e,t,r=this.maxRetries){for(let i=0;i<r;i++)try{return await e()}catch(e){if(console.error(`❌ ${t} 실패 (시도 ${i+1}/${r}):`,e),this.isRetryableError(e)&&i<r-1){let e=this.baseDelay*Math.pow(2,i);console.log(`🔄 ${e}ms 후 재시도... (${t})`),await this.sleep(e);continue}throw e}throw Error(`${t}: 최대 재시도 횟수 초과`)}isRetryableError(e){let t=e?.message||e?.toString()||"",r=e?.name||e?.constructor?.name||"";return["RateLimitError","TimeoutError","ConnectionError","ServiceUnavailable","NetworkError","FetchError","ECONNRESET","ETIMEDOUT"].some(e=>t.includes(e)||r.includes(e)||t.includes("rate limit")||t.includes("timeout")||t.includes("connection")||t.includes("network"))}async generateImage(e,t="flux-realistic",r={}){let i=Date.now();try{console.log("\uD83C\uDFA8 이미지 생성 시작:",{prompt:e,model:t,options:r});let a={aspectRatio:"16:9",numberOfImages:1,style:"digital_art",quality:"standard",optimizeForCost:!0,safetyFilter:"moderate",...r};a.optimizeForCost&&(this.model=this.genAI.getGenerativeModel({model:"gemini-2.0-flash-exp",generationConfig:{temperature:.7,maxOutputTokens:2048,candidateCount:1}}));let o=this.optimizePrompt(e,t),s=d[t];this.updateProgress("이미지 설명 생성 중...",20);let n=await this.generateEnhancedImageDescription(o,s,a);this.updateProgress("시각적 요소 생성 중...",60);let l=await this.generateAdvancedSVGImages(o,n,t,a);this.updateProgress("품질 검증 중...",90);let c=l.map(e=>this.evaluateImageQuality(e,o,t));return console.log(`⏱️ 이미지 생성 시간: ${Date.now()-i}ms`),console.log("\uD83D\uDCCA 이미지 품질 점수:",c),this.updateProgress("이미지 생성 완료!",100),l}catch(i){console.error("❌ 이미지 생성 오류:",i),this.updateProgress("폴백 이미지 생성 중...",50);let r=this.generateFallbackImage(e,t);return this.updateProgress("폴백 이미지 생성 완료!",100),[r]}}optimizePrompt(e,t){let r=d[t];return e.length>200&&(e=e.substring(0,200)+"..."),/[가-힣]/.test(e)&&(e=`[Korean Content] ${e}`),`${e}. Style: ${r.style}. Mood: ${r.mood}`}async generateEnhancedImageDescription(e,t,r){return this.retryWithExponentialBackoff(async()=>{let i=this.createQualityPrompt(e,t,r),a=await this.model.generateContent(i);if(!a?.response?.text)throw Error("이미지 설명 생성 실패");return a.response.text()},"이미지 설명 생성")}createQualityPrompt(e,t,r){return`
You are an expert AI image description generator. Create a detailed visual description for:

"${e}"

Requirements:
- Visual Elements: Focus on colors, composition, lighting, and artistic style
- Style Reference: ${t.style}
- Target Mood: ${t.mood}
- Quality Level: ${({standard:"Create clear, visually appealing images with good composition.",high:"Generate high-quality, detailed images with excellent lighting and composition.",premium:"Create premium, professional-grade images with exceptional detail, perfect lighting, and artistic composition."})[r.quality||"standard"]}
- Aspect Ratio: ${r.aspectRatio}
- Length: 100-200 words
- Format: Professional, descriptive, visually rich

Additional Guidelines:
- Include specific details about atmosphere and mood
- Describe the scene in vivid, professional terms
- Consider cultural and aesthetic appropriateness
- Ensure the description is optimized for AI image generation
`}async generateAdvancedSVGImages(e,t,r,i){let a=[];for(let o=0;o<(i.numberOfImages||1);o++){let i=this.generateAdvancedSVGImage(e,t,r);a.push(i)}return a}evaluateImageQuality(e,t,r){let i=this.evaluatePromptQuality(t),a=this.evaluateStyleMatch(r),o=this.evaluateTechnicalQuality(e);return{overall:Math.round(.3*i+.3*a+.4*o),prompt:i,style:a,technical:o}}evaluatePromptQuality(e){let t=0;return e.length>=10&&e.length<=200?t+=30:e.length>200&&(t+=20),["디테일","선명한","고화질","빛나는","어두운","밝은","색감","실사"].some(t=>e.toLowerCase().includes(t))&&(t+=40),(e.includes(",")||e.includes("및")||e.includes("와/과"))&&(t+=30),Math.min(t,100)}evaluateStyleMatch(e){return d[e]?85:70}evaluateTechnicalQuality(e){if(!e.startsWith("data:image/svg+xml;base64,"))return 50;try{let t=e.split(",")[1],r=Buffer.from(t,"base64").toString("utf8");if(!r.includes("<svg"))return 30;if(!r.includes("</svg>"))return 40;if(!(r.includes("rect")||r.includes("circle")||r.includes("text")))return 60;if(r.includes("linearGradient")||r.includes("filter"))return 90;return 80}catch(e){return 40}}generateFallbackImage(e,t){return console.log("\uD83D\uDD04 폴백 이미지 생성 중..."),this.generateSVGImage(e,t)}generateSVGImage(e,t){let r=d[t]||d["flux-realistic"],i=this.getModelColors(t);if(!r||!i)return console.warn(`⚠️ Model not found: ${t}, using fallback`),`data:image/svg+xml;base64,${Buffer.from('<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg"><rect width="512" height="512" fill="#667EEA"/><text x="256" y="256" text-anchor="middle" fill="white">AI Image</text></svg>').toString("base64")}`;let a=e.replace(/[^\w\s]/gi,"").substring(0,30)||"Generated Image",o=r.style.replace(/[^a-zA-Z0-9\s,-]/g,"").substring(0,40)||"Digital Art",s=`
      <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${i.primary};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${i.secondary};stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="512" height="512" fill="url(#bg)"/>
        <circle cx="256" cy="200" r="80" fill="${i.text}" opacity="0.3"/>
        <text x="256" y="260" text-anchor="middle" dominant-baseline="middle"
              font-family="Arial, sans-serif" font-size="20" fill="white">
          AI Generated
        </text>
        <text x="256" y="290" text-anchor="middle"
              font-family="Arial, sans-serif" font-size="14" fill="${i.text}">
          ${a}
        </text>
        <text x="256" y="310" text-anchor="middle"
              font-family="Arial, sans-serif" font-size="12" fill="${i.text}">
          ${o}
        </text>
      </svg>
    `.trim();try{let e=Buffer.from(s,"utf8");if(e.length>1e6)throw Error("SVG too large");return`data:image/svg+xml;base64,${e.toString("base64")}`}catch(e){return console.error("SVG base64 변환 오류:",e),`data:image/svg+xml;base64,${Buffer.from('<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg"><rect width="512" height="512" fill="#667EEA"/><text x="256" y="256" text-anchor="middle" fill="white">AI Image</text></svg>').toString("base64")}`}}getModelColors(e){let t={animagine31:{primary:"#FF6B9D",secondary:"#C66EFE",text:"#FFE66D"},chibitoon:{primary:"#4ECDC4",secondary:"#44A08D",text:"#F7FFF7"},"enna-sketch-style":{primary:"#2C3E50",secondary:"#34495E",text:"#ECF0F1"},"flux-schnell-dark":{primary:"#1A1A2E",secondary:"#16213E",text:"#E94560"},"flux-schnell-realitic":{primary:"#667EEA",secondary:"#764BA2",text:"#F5F5F5"},"flux-schnell-webtoon":{primary:"#FA8BFF",secondary:"#2BD2FF",text:"#2B1055"},"flux-dark":{primary:"#1A1A2E",secondary:"#16213E",text:"#E94560"},"flux-realistic":{primary:"#667EEA",secondary:"#764BA2",text:"#F5F5F5"},"flux-webtoon":{primary:"#FA8BFF",secondary:"#2BD2FF",text:"#2B1055"}},r=t["flux-realistic"];return t[e]||r||(console.warn(`⚠️ Color scheme not found for model: ${e}`),r)}generateAdvancedSVGImage(e,t,r){let i=d[r]||d["flux-realistic"],a=this.getModelColors(r);if(!i||!a)return console.warn(`⚠️ Model not found: ${r}, using fallback`),this.generateSVGImage(e,"flux-realistic");let o=t.toLowerCase().split(" ").filter(e=>e.length>3).slice(0,5),s=`
      <svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${a.primary};stop-opacity:1" />
            <stop offset="50%" style="stop-color:${a.secondary};stop-opacity:0.8" />
            <stop offset="100%" style="stop-color:${a.primary};stop-opacity:0.6" />
          </linearGradient>
          <radialGradient id="bg2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style="stop-color:${a.text};stop-opacity:0.2" />
            <stop offset="100%" style="stop-color:${a.primary};stop-opacity:0.8" />
          </radialGradient>
          <filter id="blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
          </filter>
        </defs>

        <!-- 배경 -->
        <rect width="1024" height="1024" fill="url(#bg1)"/>
        <circle cx="512" cy="512" r="400" fill="url(#bg2)" opacity="0.5"/>

        <!-- 장식 요소 -->
        <g opacity="0.3">
          <circle cx="200" cy="200" r="50" fill="${a.text}" filter="url(#blur)"/>
          <circle cx="824" cy="200" r="30" fill="${a.secondary}" filter="url(#blur)"/>
          <circle cx="200" cy="824" r="40" fill="${a.secondary}" filter="url(#blur)"/>
          <circle cx="824" cy="824" r="60" fill="${a.text}" filter="url(#blur)"/>
        </g>

        <!-- 중앙 콘텐츠 -->
        <g>
          <rect x="100" y="350" width="824" height="324" rx="20" fill="rgba(0,0,0,0.3)" stroke="${a.text}" stroke-width="2"/>

          <text x="512" y="450" text-anchor="middle" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="white">
            AI Generated
          </text>

          <text x="512" y="500" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="${a.text}">
            ${r.charAt(0).toUpperCase()+r.slice(1)}
          </text>

          <text x="512" y="540" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="${a.text}">
            ${i?.style?.substring(0,60)||"AI Image Style"}...
          </text>

          ${o.map((e,t)=>`<text x="${150+t%3*250}" y="${580+25*Math.floor(t/3)}" font-family="Arial, sans-serif" font-size="12" fill="${a.text}" opacity="0.8">
              ${e}
            </text>`).join("")}
        </g>

        <!-- 하단 정보 -->
        <text x="512" y="750" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="white" opacity="0.7">
          Powered by Gemini AI
        </text>

        <text x="512" y="775" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="${a.text}" opacity="0.6">
          ${new Date().toLocaleDateString()}
        </text>
      </svg>
    `.trim();try{let e=Buffer.from(s,"utf8");if(e.length>2e6)throw Error("Advanced SVG too large");return`data:image/svg+xml;base64,${e.toString("base64")}`}catch(t){return console.error("Advanced SVG base64 변환 오류:",t),this.generateSVGImage(e,r)}}async generateImagesForScript(e,t="flux-realistic"){let r={opening:"",snippets:[]};try{if(e.openingSegment?.imageGenPrompt){let i=await this.generateImage(e.openingSegment.imageGenPrompt,t,{aspectRatio:"9:16"});r.opening=i[0]}if(e.snippets){for(let i of e.snippets)if(i.imageGenPrompt){let e=await this.generateImage(i.imageGenPrompt,t,{aspectRatio:"9:16"});r.snippets.push(e[0])}}return r}catch(e){throw console.error("스크립트용 이미지 생성 오류:",e),e}}}let u=null,m=()=>{let e=Date.now();if(u&&e-u.createdAt<3e5)return u.lastUsed=e,console.log("\uD83D\uDD04 캐시된 Vertex AI 인스턴스 재사용"),u.instance;try{let t=c(),r=new g(t);return u={instance:r,createdAt:e,lastUsed:e},console.log("\uD83C\uDD95 새로운 Vertex AI 인스턴스 생성"),r}catch(e){if(console.error("❌ Vertex AI 인스턴스 생성 실패:",e),u)return console.log("\uD83D\uDD04 기존 Vertex AI 인스턴스를 대체로 사용합니다"),u.instance;throw e}};async function p(e){try{let t=await e.json();if(!t.script||!t.model)return n.NextResponse.json({error:"script와 model 필드가 필요합니다."},{status:400});let r=t.script,i=t.model||"flux-realistic",a=m(),o=await a.generateImagesForScript(r,i),s=[o.opening,...o.snippets].filter(Boolean);return n.NextResponse.json({success:!0,data:{images:s,openingImage:o.opening,snippetImages:o.snippets,model:i,totalGenerated:s.length}})}catch(e){return console.error("이미지 생성 API 오류:",e),n.NextResponse.json({error:"이미지 생성에 실패했습니다.",details:e instanceof Error?e.message:"알 수 없는 오류"},{status:500})}}async function h(){return n.NextResponse.json({message:"SurvivingVid 이미지 생성 API",endpoints:{POST:"/api/generate-images",description:"Vertex AI를 사용한 이미지 생성"},usage:{script:"ScriptResponse (필수) - 생성된 스크립트 데이터",model:"AIImageModel (선택) - 이미지 생성 모델 (기본값: flux-realistic)"},availableModels:{animagine31:"애니메이션 스타일",chibitoon:"치비 만화 스타일","enna-sketch":"스케치 스타일","flux-dark":"FLUX 다크톤","flux-realistic":"FLUX 사실적","flux-webtoon":"FLUX 웹툰 스타일"}})}let f=new a.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/api/generate-images/route",pathname:"/api/generate-images",filename:"route",bundlePath:"app/api/generate-images/route"},resolvedPagePath:"C:\\projects\\survivingvid\\src\\app\\api\\generate-images\\route.ts",nextConfigOutput:"",userland:i}),{requestAsyncStorage:y,staticGenerationAsyncStorage:x,serverHooks:w}=f,A="/api/generate-images/route";function v(){return(0,s.patchFetch)({serverHooks:w,staticGenerationAsyncStorage:x})}}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),i=t.X(0,[9276,5972,1258],()=>r(4272));module.exports=i})();