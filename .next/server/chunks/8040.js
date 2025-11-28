"use strict";exports.id=8040,exports.ids=[8040],exports.modules={8040:(e,t,i)=>{i.r(t),i.d(t,{GET:()=>y,POST:()=>d,generateImage:()=>h});var a=i(7070),r=i(9137);let o=[{id:"animagine31",name:"Animagine V3.1",displayName:"애니메이션",description:"고품질 애니메이션 및 일러스트 생성",category:"anime",thumbnail:"/assets/ImageModels/animagine31.png",style:"anime, high quality, detailed illustration",promptPrefix:"anime style, high quality illustration, vibrant colors, detailed character design",recommendedFor:["애니메이션 캐릭터","일러스트","만화 스타일"],features:["선명한 색상","디테일한 디자인","캐릭터 중심"]},{id:"chibitoon",name:"Chibi Toon",displayName:"치비 툰",description:"귀여운 치비 스타일의 만화 이미지",category:"cartoon",thumbnail:"/assets/ImageModels/chibitoon.png",style:"chibi, cartoon, cute, adorable",promptPrefix:"chibi style, cute cartoon character, adorable design, simplified features",recommendedFor:["치비 캐릭터","귀여운 스타일","심볼릭"],features:["귀여운 디자인","단순화된 특징","화려한 색상"]},{id:"enna-sketch-style",name:"Enna Sketch",displayName:"스케치 스타일",description:"필기체 스케치와 드로잉 스타일",category:"sketch",thumbnail:"/assets/ImageModels/enna-sketch-style.png",style:"sketch, drawing, hand drawn, pencil art",promptPrefix:"pencil sketch style, hand drawn illustration, artistic drawing, sketchy lines",recommendedFor:["필기체 스케치","콘셉트 아트","아트워크"],features:["필기체 질감","예술적 표현","드로잉 스타일"]},{id:"flux-schnell-dark",name:"FLUX Schnell Dark",displayName:"다크 테마",description:"어둡고 드라마틱한 분위기의 이미지",category:"dark",thumbnail:"/assets/ImageModels/flux-schnell-dark.png",style:"dark theme, dramatic, moody, atmospheric",promptPrefix:"dark atmospheric theme, dramatic lighting, moody shadows, cinematic darkness",recommendedFor:["다크 판타지","스릴러","드라마틱한 장면"],features:["어두운 분위기","드라마틱 조명","시네마틱"]},{id:"flux-schnell-realitic",name:"FLUX Schnell Realistic",displayName:"사실적",description:"매우 사실적이고 고품질한 이미지",category:"realistic",thumbnail:"/assets/ImageModels/flux-schnell-realitic.png",style:"realistic, photorealistic, high detail, professional",promptPrefix:"photorealistic, ultra detailed, professional photography, high resolution",recommendedFor:["사진","상업용 이미지","리얼리즘"],features:["초고해상도","사진적 품질","프로페셔널"]},{id:"flux-schnell-webtoon",name:"FLUX Schnell Webtoon",displayName:"웹툰",description:"웹툰 스타일의 만화 이미지",category:"cartoon",thumbnail:"/assets/ImageModels/flux-schnell-webtoon.png",style:"webtoon, manga, comic book style, vibrant",promptPrefix:"webtoon style, comic book illustration, vibrant colors, manga inspired",recommendedFor:["웹툰","망가","코믹북"],features:["웹툰 스타일","선명한 라인","색상 표현"]}],l=e=>o.find(t=>t.id===e);o[0];class s{constructor(e){if(this.baseUrl="https://generativelanguage.googleapis.com/v1beta",this.apiKey=e||process.env.GOOGLE_AI_API_KEY||"",!this.apiKey)throw Error("Google AI API key required")}getModelName(e){return({animagine31:"imagen-3.0-generate-001",chibitoon:"imagen-3.0-generate-001","enna-sketch-style":"imagen-3.0-generate-001","flux-schnell-dark":"imagen-3.0-generate-001","flux-schnell-realitic":"imagen-3.0-generate-001","flux-schnell-webtoon":"imagen-3.0-generate-001"})[e]||"imagen-3.0-generate-001"}getImagenStyle(e){return({animagine31:"anime",chibitoon:"cute-cartoon","enna-sketch-style":"sketch","flux-schnell-dark":"dramatic","flux-schnell-realitic":"photorealistic","flux-schnell-webtoon":"digital-art"})[e]||"photorealistic"}async generateImage(e){try{let t=this.getModelName(e.model),i=this.getImagenStyle(e.model),a=e.aspectRatio||"16:9";console.log(`🎨 Imagen 이미지 생성: ${t}, 스타일: ${i}`);let r={prompt:e.prompt,numberOfImages:1,aspectRatio:a,safetyFilterLevel:"block_some",personGeneration:"allow_adult"},o=await fetch(`${this.baseUrl}/models/${t}:generate?key=${this.apiKey}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(r)});if(!o.ok){let t=await o.text();return console.error(`Imagen API 오류: ${o.status}`,t),this.createFallbackImage(e.prompt,e.model)}let l=await o.json();if(!l.generatedImages||0===l.generatedImages.length)return console.error("Imagen API: 이미지 생성 결과 없음"),this.createFallbackImage(e.prompt,e.model);let s=l.generatedImages[0].bytesBase64Encoded,n=l.generatedImages[0].width||1024,c=l.generatedImages[0].height||1024;return{success:!0,images:[`data:image/png;base64,${s}`],metadata:{width:n,height:c,model:t}}}catch(t){return console.error("Imagen 이미지 생성 실패:",t.message),this.createFallbackImage(e.prompt,e.model)}}createFallbackImage(e,t){let i={animagine31:{bg:"#2D1B69",text:"#FFD700",accent:"#FF69B4"},chibitoon:{bg:"#FFB6C1",text:"#FF1493",accent:"#87CEEB"},"enna-sketch-style":{bg:"#F5F5F5",text:"#333333",accent:"#666666"},"flux-schnell-dark":{bg:"#1C1C1C",text:"#E0E0E0",accent:"#FF6B6B"},"flux-schnell-realitic":{bg:"#87CEEB",text:"#FFFFFF",accent:"#4682B4"},"flux-schnell-webtoon":{bg:"#FFE4E1",text:"#DC143C",accent:"#20B2AA"}},a=i[t]||i["flux-schnell-realitic"],r=`
      <svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${a.accent};stop-opacity:0.3" />
            <stop offset="100%" style="stop-color:${a.bg};stop-opacity:1" />
          </linearGradient>
          <filter id="shadow">
            <feDropShadow dx="3" dy="3" stdDeviation="3" flood-opacity="0.3"/>
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="${a.bg}"/>
        <rect width="100%" height="100%" fill="url(#grad1)"/>

        <!-- 중앙 원형 디자인 -->
        <circle cx="960" cy="540" r="200" fill="${a.accent}" opacity="0.2"/>
        <circle cx="960" cy="540" r="150" fill="${a.accent}" opacity="0.3"/>
        <circle cx="960" cy="540" r="100" fill="${a.accent}" opacity="0.4"/>

        <!-- AI 아이콘 -->
        <text x="960" y="480" text-anchor="middle" fill="${a.text}" font-size="60" font-family="Arial, sans-serif" font-weight="bold" filter="url(#shadow)">✨ AI IMAGE ✨</text>

        <!-- 메인 텍스트 -->
        <text x="960" y="560" text-anchor="middle" fill="${a.text}" font-size="28" font-family="Arial, sans-serif" filter="url(#shadow)">
          "${e.substring(0,60)}${e.length>60?"...":""}"
        </text>

        <!-- 모델 정보 -->
        <text x="960" y="600" text-anchor="middle" fill="${a.accent}" font-size="18" font-family="Arial, sans-serif">
          Model: ${t}
        </text>

        <!-- 하단 정보 -->
        <text x="960" y="1020" text-anchor="middle" fill="${a.text}" font-size="16" font-family="Arial, sans-serif" opacity="0.7">
          Generated by SurvivingVid AI Image System
        </text>
      </svg>
    `,o=Buffer.from(r).toString("base64");return{success:!0,images:[`data:image/svg+xml;base64,${o}`],metadata:{width:1920,height:1080,model:`fallback-${t}`}}}async generateImagesForScript(e){let t=[];try{let i=e.snippets?.slice(0,3)||[];for(let e=0;e<i.length;e++){let a=i[e],r=a.imageGenPrompt||a.segmentTitle||`Scene ${e+1}`,o=["flux-schnell-realitic","animagine31","flux-schnell-dark"],l=o[e%o.length],s=await this.generateImage({prompt:r,model:l,aspectRatio:"16:9"});s.success&&s.images&&t.push(...s.images)}return{success:!0,images:t,metadata:{width:1920,height:1080,model:"imagen-3.0-generate-001"}}}catch(e){return{success:!1,error:e.message}}}}let n=null,c=e=>(n||(n=new s(e)),n);async function d(e){let t=Date.now();try{let i=await g(e);console.log("\uD83C\uDFA8 이미지 생성 시작:",{videoId:i.videoId,prompt:i.imagePrompt.substring(0,50)+"...",model:i.imageModel,options:i.options});let o=`img_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,l=await f(i.imagePrompt,i.sceneDescription||"",i.imageModel||"flux-realistic",i.options||{});if(!l||!l.dataUrl)throw Error("이미지 생성 결과가 올바르지 않습니다.");let s=Date.now()-t,n={videoId:i.videoId,imageId:o,prompt:i.imagePrompt,sceneDescription:i.sceneDescription||"",timestamp:i.timestamp||"00:00:00",imageModel:i.imageModel||"flux-realistic",imageUrl:`/api/video/images/${o}`,createdAt:new Date().toISOString(),status:"completed",dataUrl:l.dataUrl,width:l.width,height:l.height,processingTime:s,options:i.options,metadata:{aiModel:"vertex-ai-enhanced",quality:i.options?.quality||"standard",fallbackUsed:l.fallbackUsed||!1}};return console.log("\uD83D\uDCE6 스토리지 저장 시도:",{imageId:o,videoId:i.videoId}),r.j.setImage(o,n),console.log("✅ 스토리지 저장 완료. 현재 저장된 이미지 수:",r.s.size),console.log(`✅ 이미지 생성 완료: ${s}ms`),a.NextResponse.json({success:!0,imageId:o,imageUrl:n.imageUrl,prompt:i.imagePrompt,sceneDescription:i.sceneDescription,status:"completed",dimensions:{width:l.width,height:l.height},metadata:{videoId:i.videoId,imageModel:i.imageModel||"flux-realistic",createdAt:n.createdAt,processingTime:s,aiModel:"vertex-ai-enhanced",quality:i.options?.quality||"standard",fallbackUsed:l.fallbackUsed||!1},performance:{promptQuality:p(i.imagePrompt),generationSpeed:Math.round(l.width*l.height/s)}})}catch(i){let e=Date.now()-t;return console.error("❌ 이미지 생성 오류:",{error:i.message,stack:i.stack,processingTime:e}),a.NextResponse.json({success:!1,prompt:"",sceneDescription:"",status:"failed",metadata:{videoId:"unknown",imageModel:"unknown",createdAt:new Date().toISOString(),processingTime:e,aiModel:"error",quality:"standard",fallbackUsed:!1},error:`이미지 생성 중 오류가 발생했습니다: ${i.message}`},{status:500})}}async function g(e){try{let t=await e.json();if(!t||"object"!=typeof t)throw Error("유효한 JSON 요청 본문이 필요합니다.");if(!t.videoId||"string"!=typeof t.videoId)throw Error("videoId는 필수 항목이며, 문자열이어야 합니다.");if(!t.imagePrompt||"string"!=typeof t.imagePrompt||0===t.imagePrompt.trim().length)throw Error("imagePrompt는 필수 항목이며, 비어있지 않은 문자열이어야 합니다.");if(t.imagePrompt.length>1e3)throw Error("imagePrompt는 1000자를 초과할 수 없습니다.");if(t.imageModel&&!l(t.imageModel)&&(console.warn(`⚠️ 유효하지 않은 이미지 모델: ${t.imageModel}, 기본 모델 사용`),t.imageModel="flux-realistic"),t.options){if(t.options.aspectRatio&&!["1:1","9:16","16:9"].includes(t.options.aspectRatio))throw Error(`유효하지 않은 aspectRatio: ${t.options.aspectRatio}`);if(t.options.quality&&!["standard","high","premium"].includes(t.options.quality))throw Error(`유효하지 않은 quality: ${t.options.quality}`)}return t}catch(e){if(e instanceof SyntaxError)throw Error("잘못된 JSON 형식입니다.");throw e}}async function f(e,t,i,a){try{console.log("\uD83C\uDFA8 향상된 Vertex AI 이미지 생성 시작:",{prompt:e.substring(0,50),sceneDescription:t.substring(0,30),imageModel:i,options:a});let r=c(),o=await r.generateImage({prompt:e,model:i,aspectRatio:a.aspectRatio||"16:9",quality:a.quality});if(o.success&&o.images&&o.images.length>0){let e=o.images[0];return console.log("✅ 향상된 Vertex AI 이미지 생성 성공"),{dataUrl:e,width:1920,height:1080,fallbackUsed:!1}}throw Error("Vertex AI에서 유효한 이미지를 생성하지 못했습니다.")}catch(a){return console.error("❌ 향상된 Vertex AI 이미지 생성 실패:",a),console.log("\uD83D\uDD04 폴백 이미지 생성으로 전환..."),m(e,t,i)}}async function h(e,t,i="flux-realistic"){console.log("\uD83C\uDFA8 Vertex AI 이미지 생성 시작:",{prompt:e.substring(0,50),sceneDescription:t.substring(0,30),imageModel:i});try{let t=c(),a=await t.generateImage({prompt:e,model:i,aspectRatio:"16:9"});if(a.success&&a.images&&a.images.length>0)return console.log("✅ Google Imagen 이미지 생성 성공"),{dataUrl:a.images[0],width:a.metadata?.width||1920,height:a.metadata?.height||1080};throw Error("Google Imagen에서 이미지를 생성하지 못했습니다.")}catch(a){return console.error("❌ Vertex AI 이미지 생성 실패:",a),console.log("\uD83D\uDD04 폴백 SVG 이미지 생성으로 전환..."),m(e,t,i)}}async function m(e,t,i){let a=i?l(i):null,r=function(e,t,i){let a={colors:[],objects:[],mood:i?.category||"neutral",style:i?.style||"realistic"};for(let[i,r]of(["blue","red","green","yellow","orange","purple","pink","white","black"].forEach(i=>{(e.toLowerCase().includes(i)||t.toLowerCase().includes(i))&&a.colors.push(i)}),["person","building","tree","car","food","computer","phone","book","mountain","ocean"].forEach(i=>{(e.toLowerCase().includes(i)||t.toLowerCase().includes(i))&&a.objects.push(i)}),Object.entries({dramatic:["dramatic","intense","powerful","emotional"],bright:["bright","happy","cheerful","colorful","vibrant"],calm:["calm","peaceful","serene","quiet","gentle"],professional:["professional","business","corporate","formal"],natural:["nature","natural","outdoor","green","organic"]})))if(r.some(i=>e.toLowerCase().includes(i)||t.toLowerCase().includes(i))){a.mood=i;break}return a}(e,t,a);try{console.log("\uD83C\uDFA8 SVG 이미지 생성 시작:",{prompt:e.substring(0,30),sceneDescription:t.substring(0,20),imageModel:i});let o=function(e,t,i,a,r,o){var l;let s=function(e){let t={blue:{start:"#dbeafe",end:"#3b82f6",primary:"#2563eb",secondary:"#60a5fa"},red:{start:"#fee2e2",end:"#ef4444",primary:"#dc2626",secondary:"#f87171"},green:{start:"#dcfce7",end:"#22c55e",primary:"#16a34a",secondary:"#4ade80"},yellow:{start:"#fef3c7",end:"#eab308",primary:"#ca8a04",secondary:"#facc15"},purple:{start:"#f3e8ff",end:"#a855f7",primary:"#9333ea",secondary:"#c084fc"},pink:{start:"#fce7f3",end:"#ec4899",primary:"#db2777",secondary:"#f9a8d4"}},i=e.length>0&&t[e[0]]?e[0]:"blue";return t[i]}(r.colors),n=s.primary,c=s.secondary,d=r.objects.map(e=>({person:'<g transform="translate(200, 300)"><circle cx="0" cy="0" r="20" fill="#94a3b8" /><rect x="-15" y="20" width="30" height="40" rx="5" fill="#94a3b8" /></g>',building:'<g transform="translate(1500, 400)"><rect x="0" y="0" width="60" height="80" fill="#cbd5e1" /><rect x="10" y="10" width="10" height="10" fill="#3b82f6" /><rect x="25" y="10" width="10" height="10" fill="#3b82f6" /><rect x="40" y="10" width="10" height="10" fill="#3b82f6" /><rect x="10" y="25" width="10" height="10" fill="#3b82f6" /><rect x="25" y="25" width="10" height="10" fill="#3b82f6" /><rect x="40" y="25" width="10" height="10" fill="#3b82f6" /></g>',tree:'<g transform="translate(800, 600)"><rect x="-10" y="0" width="20" height="40" fill="#92400e" /><circle cx="0" cy="-20" r="40" fill="#22c55e" /><circle cx="-15" cy="-10" r="25" fill="#16a34a" /><circle cx="15" cy="-10" r="25" fill="#16a34a" /></g>',car:'<g transform="translate(1000, 700)"><rect x="0" y="10" width="60" height="20" rx="5" fill="#3b82f6" /><rect x="10" y="0" width="40" height="15" rx="3" fill="#60a5fa" /><circle cx="15" cy="30" r="8" fill="#1e293b" /><circle cx="45" cy="30" r="8" fill="#1e293b" /></g>',computer:'<g transform="translate(1200, 350)"><rect x="0" y="0" width="50" height="35" rx="2" fill="#475569" /><rect x="5" y="5" width="40" height="25" fill="#38bdf8" /><rect x="15" y="35" width="20" height="5" fill="#64748b" /></g>',food:'<g transform="translate(600, 500)"><circle cx="0" cy="0" r="25" fill="#f59e0b" /><circle cx="-8" cy="-8" r="5" fill="#dc2626" /><circle cx="8" cy="-8" r="5" fill="#dc2626" /></g>',phone:'<g transform="translate(1400, 450)"><rect x="-10" y="-20" width="20" height="40" rx="3" fill="#1e293b" /><rect x="-8" y="-15" width="16" height="25" fill="#60a5fa" /></g>',book:'<g transform="translate(300, 550)"><rect x="0" y="0" width="30" height="40" rx="2" fill="#dc2626" /><rect x="2" y="5" width="26" height="2" fill="white" /><rect x="2" y="10" width="20" height="2" fill="white" /><rect x="2" y="15" width="24" height="2" fill="white" /></g>',mountain:'<g transform="translate(1600, 600)"><polygon points="0,50 40,0 80,50" fill="#6b7280" /><polygon points="30,50 60,20 90,50" fill="#9ca3af" /><polygon points="40,50 70,30 100,50" fill="#d1d5db" /></g>',ocean:'<g transform="translate(400, 750)"><path d="M0,0 Q10,-5 20,0 T40,0 T60,0 T80,0" stroke="#3b82f6" stroke-width="3" fill="none" /><path d="M0,10 Q10,5 20,10 T40,10 T60,10 T80,10" stroke="#60a5fa" stroke-width="2" fill="none" /></g>'})[e]||"").filter(Boolean),g=(l=r.mood,({dramatic:`
      <rect x="0" y="0" width="100%" height="100%" fill="black" opacity="0.3" />
      <polygon points="0,0 200,0 0,200" fill="white" opacity="0.1" />
      <polygon points="1920,1080 ${1720},1080 1920,${880}" fill="white" opacity="0.1" />
    `,bright:`
      <circle cx="85%" cy="15%" r="100" fill="#fbbf24" opacity="0.4" />
      <circle cx="75%" cy="25%" r="50" fill="#f59e0b" opacity="0.3" />
    `,calm:`
      <ellipse cx="50%" cy="80%" rx="${640}" ry="100" fill="#e0f2fe" opacity="0.5" />
    `,professional:`
      <rect x="0" y="0" width="100%" height="100%" fill="url(#verticalStripes)" opacity="0.1" />
      <defs>
        <pattern id="verticalStripes" patternUnits="userSpaceOnUse" width="20" height="20">
          <rect width="10" height="20" fill="#e2e8f0" />
          <rect x="10" width="10" height="20" fill="#f1f5f9" />
        </pattern>
      </defs>
    `,natural:`
      <ellipse cx="15%" cy="70%" rx="300" ry="150" fill="#86efac" opacity="0.3" />
      <ellipse cx="85%" cy="65%" rx="250" ry="180" fill="#4ade80" opacity="0.2" />
    `})[l]||"");return`
    <svg xmlns="http://www.w3.org/2000/svg" width="${1920}" height="${1080}" viewBox="0 0 ${e} ${t}">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${s.start};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${s.end};stop-opacity:1" />
        </linearGradient>
        <radialGradient id="centerGradient">
          <stop offset="0%" style="stop-color:${n};stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:${c};stop-opacity:0.1" />
        </radialGradient>
      </defs>

      <!-- 배경 -->
      <rect width="100%" height="100%" fill="url(#bgGradient)" />
      ${g}

      <!-- 장식 요소 -->
      <circle cx="80%" cy="20%" r="150" fill="url(#centerGradient)" opacity="0.6" />
      <circle cx="20%" cy="80%" r="200" fill="url(#centerGradient)" opacity="0.4" />

      <!-- 아이콘들 -->
      ${d.join("\n      ")}

      <!-- 텍스트 내용 -->
      <g>
        <!-- 메인 타이틀 -->
        <rect x="50" y="${t/2-100}" width="${e-100}" height="80" rx="10" fill="white" fill-opacity="0.9" />
        <text x="50%" y="${t/2-50}" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#1e293b">
          ${a.substring(0,60)}${a.length>60?"...":""}
        </text>

        <!-- 서브 타이틀 -->
        <text x="50%" y="${t/2-20}" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#64748b">
          ${o?.displayName||"AI 이미지"} 모드
        </text>

        <!-- 모델 정보 -->
        <text x="50%" y="${t/2+5}" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#94a3b8">
          ${i.substring(0,100)}${i.length>100?"...":""}
        </text>
      </g>

      <!-- 하단 정보 -->
      <g>
        <rect x="50" y="${t-150}" width="300" height="80" rx="8" fill="white" fill-opacity="0.8" />
        <text x="70" y="${t-120}" font-family="Arial, sans-serif" font-size="14" fill="#475569">
          ${o?.displayName||"AI"} 이미지 생성
        </text>
        <text x="70" y="${t-100}" font-family="Arial, sans-serif" font-size="12" fill="#94a3b8">
          스타일: ${o?.category||"일반"}
        </text>
        <text x="70" y="${t-80}" font-family="Arial, sans-serif" font-size="12" fill="#94a3b8">
          생성 시간: ${new Date().toLocaleTimeString()}
        </text>
      </g>

      <!-- 상태 표시 -->
      <g>
        <rect x="${e-250}" y="50" width="200" height="60" rx="8" fill="#fef3c7" stroke="#f59e0b" stroke-width="2" />
        <text x="${e-150}" y="75" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#92400e">
          ${o?.displayName||"폴백"} 이미지
        </text>
        <text x="${e-150}" y="95" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#78350f">
          Vertex AI ${o?"연결 실패 - 스타일 적용":"연결 실패"}
        </text>
      </g>
    </svg>
  `}(1920,1080,e,t,r,a);console.log("✅ SVG 이미지 생성 성공, 길이:",o.length);let l=`data:image/svg+xml;base64,${Buffer.from(o).toString("base64")}`;return console.log("✅ base64 데이터 URL 생성 성공"),console.log("✅ 폴백 이미지 생성 완료:",{width:1920,height:1080,dataUrlLength:l.length}),{dataUrl:l,width:1920,height:1080}}catch(a){console.error("❌ SVG 이미지 생성 실패:",a),console.log("\uD83D\uDD04 최후의 수단 간단한 SVG 이미지 생성으로 전환...");let e=`
      <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f0f9ff;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#e0f2fe;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)" />
        <text x="50%" y="40%" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" fill="#1e40af">
          AI 이미지 생성
        </text>
        <text x="50%" y="50%" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#64748b">
          ${t.substring(0,50)}...
        </text>
        <text x="50%" y="60%" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#94a3b8">
          Vertex AI 연결 실패 - 폴백 이미지
        </text>
        <rect x="20%" y="70%" width="60%" height="2" fill="#cbd5e1" />
        <text x="50%" y="80%" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#64748b">
          생성 시간: ${new Date().toLocaleTimeString()}
        </text>
      </svg>
    `,i=`data:image/svg+xml;base64,${Buffer.from(e).toString("base64")}`;return console.log("✅ 간단한 SVG 이미지 생성 완료"),console.log("✅ 최종 폴백 이미지 반환:",{width:1920,height:1080,dataUrlLength:i.length}),{dataUrl:i,width:1920,height:1080}}}function p(e){let t=0;return e.length>=10&&e.length<=200?t+=25:e.length>200&&(t+=15),["디테일","선명한","고화질","빛나는","어두운","밝은","색감","실사","선명한"].some(t=>e.toLowerCase().includes(t))&&(t+=35),(e.includes(",")||e.includes("및")||e.includes("와/과"))&&(t+=20),/[가-힣]/.test(e)&&(t+=10),e.length>50&&(t+=10),Math.min(t,100)}async function y(e){try{let{searchParams:t}=new URL(e.url),i=t.get("videoId");if(!i)return a.NextResponse.json({success:!1,error:"videoId가 필요합니다.",images:[],totalImages:0,metadata:{requestedAt:new Date().toISOString(),totalStoredImages:r.s.size}},{status:400});console.log("\uD83D\uDD0D 향상된 이미지 조회 요청:",{videoId:i,totalStoredImages:r.s.size});let o=r.j.getImagesByVideoId(i).map(e=>({...e,quality:p(e.prompt),age:Date.now()-new Date(e.createdAt).getTime(),isRecent:Date.now()-new Date(e.createdAt).getTime()<864e5}));return console.log("\uD83D\uDCCB 향상된 조회 결과:",{foundImages:o.length,imageIds:o.map(e=>e.imageId),averageQuality:o.length>0?Math.round(o.reduce((e,t)=>e+t.quality,0)/o.length):0}),a.NextResponse.json({success:!0,videoId:i,images:o,totalImages:o.length,metadata:{requestedAt:new Date().toISOString(),totalStoredImages:r.s.size,averageQuality:o.length>0?Math.round(o.reduce((e,t)=>e+t.quality,0)/o.length):0,recentImages:o.filter(e=>e.isRecent).length}})}catch(e){return console.error("이미지 목록 조회 오류:",e),a.NextResponse.json({success:!1,error:"이미지 목록 조회 중 오류가 발생했습니다.",images:[],totalImages:0,metadata:{requestedAt:new Date().toISOString(),totalStoredImages:r.s.size}},{status:500})}}},9137:(e,t,i)=>{i.d(t,{j:()=>r,s:()=>a});let a=new Map,r={setImage(e,t){a.set(e,t)},getImage:e=>a.get(e),deleteImage:e=>a.delete(e),getImagesByVideoId:e=>Array.from(a.values()).filter(t=>t.videoId===e).map(e=>({imageId:e.imageId,imageUrl:e.imageUrl,sceneDescription:e.sceneDescription,prompt:e.prompt,status:e.status,createdAt:e.createdAt,reviewed:e.reviewed||!1,approved:e.approved,regenerations:e.regenerations||0})).sort((e,t)=>new Date(e.createdAt).getTime()-new Date(t.createdAt).getTime()),clear(){a.clear()}}}};