<div align="center">
    <div style="width: 800px"> <!--전체 넓이!! 지우면 X-->
        <div align="center">
            <h3>[블록체인 기반 TCG 카드 P2P 경매 플랫폼]</h3>
                <h1><img src="./readme-assets/takoko.png" width="30px" /> TAKO <img src="./readme-assets/takoko.png" width="30px" /></h1>
                <a href="https://tako.today" target="_blank"><img src="./readme-assets/main_banner.png" width="90%"/></a>
            <br/><br/>
            <div style="width: 550px">
              <p>
                <strong>블록체인</strong>과 <strong>객체 탐지 모델</strong>을 결합하여<br> <strong>TCG(Trading Card Game) 카드 거래</strong> 시장을 혁신하는 <strong>경매 플랫폼</strong>
                <br><br>
                AI가 카드의 품질을 객관적으로 평가하고, 블록체인 기술로 안전하고 투명한 경매 거래와 각 상품에 대한 경매 기록을 위변조 불가능한 디지털 자산으로 보관하는 서비스를 제공하여 기존 중고 카드 시장의 핵심 문제인 불신과 위변조 위험을 해결합니다.
                </p>
            </div>
            <div align=center style="width: 300px">
              <div align=left>
                  <ul>
                      <li><strong>개발 기간</strong> : 2025.08.07 ~ 2025.09.29 (<strong>7주</strong>)</li>
                      <li><strong>플랫폼</strong> : Web</li>
                      <li><strong>개발 인원</strong> : 5명</li>
                      <li><strong>기관</strong> : 삼성 청년 SW·AI 아카데미 13기</li>
                  </ul>
              </div>
            </div>
            <hr/>
            <h3><img src="./readme-assets/YouTube.svg.webp" width="30px" /> 영상 포트폴리오 🔗</h3>
                <a href="https://www.youtube.com/watch?v=cBSUnD1ZEvY" target="_blank"><img src="./readme-assets/video_portfolio.png" width="80%"/></a>
        </div>
        <br><br><br>
        <h2 align=left>🔎 목차</h2>
        <div align="left">
            <h4><a href="#developers">✨ 팀 구성</a></h4>
            <h4><a href="#techStack">🛠️ 기술 스택</a></h4>
            <h4><a href="#ciCd">🖧 CI/CD</a></h4>
            <h4><a href="#keyFeatures">🌠 주요 기능</a></h4>
            <h4><a href="#directories">📂 디렉터리 구조</a></h4>
            <h4><a href="#projectDeliverables">📦 프로젝트 산출물</a></h4>
        </div>
        <br><br>
        <h2 align="left"><a name="developers">✨ 팀 구성</a></h2>
        <div align="center"> <!-- 팀구성 시작 -->
            <table>
                <tr>
                    <td width="20%" align="center">
                        <a href="https://github.com/0w0n2" target="_blank">
                        <img src="./readme-assets/hyewon_lee.png" width="140px" /> <br>
                        <p valign="top">
                        <strong>이혜원 (팀장)</strong><br>
                        《Backend & DApp》 </a></p>
                    </td>
                    <td width="20%" align="center">
                        <a href="https://github.com/Me-in-U" target="_blank">
                        <img src="./readme-assets/mingyu_kim.png" width="140px" /> <br>
                        <p valign="top">
                        <strong>김민규</strong><br>
                        《Backend》 </a></p>
                    </td>
                    <td width="20%" align="center">
                        <a href="https://github.com/seok0205" target="_blank">
                        <img src="./readme-assets/jeongseok_yu.png" width="140px" /> <br>
                        <p valign="top">
                        <strong>유정석</strong><br>
                        《DevOps & DApp》 </a></p>
                    </td>
                    <td width="20%" align="center">
                        <a href="https://github.com/onearmedoflepanto" target="_blank">
                        <img src="./readme-assets/jaeik_lee.png" width="140px" /> <br>
                        <p valign="top">
                        <strong>이재익</strong><br>
                        《Frontend & AI》 </a></p>
                    </td>
                    <td width="20%" align="center">
                        <a href="https://github.com/Jodndud" target="_blank">
                        <img src="./readme-assets/wooyeong_jo.png" width="140px" /> <br>
                        <strong>조우영</strong><br>
                        (Frontend》 </a></p>
                    </td>
                </tr>
                <tr>
                  <td width="168px" valign="top">
                    <sub>
                      - DApp 경매 에스크로 컨트랙트 개발<br>
                      - Spring Security 기반 인증 API 구현<br>
                      - Web3j 활용 블록체인-DB 정합성 검증 및 낙찰 후속 처리 리스너 구현
                    </sub>
                  </td>
                  <td width="168px" valign="top">
                    <sub>
                      - 스케줄러 기반 경매 자동화 API 구현<br>
                      - Redis(Lua) 활용 실시간 입찰 및 인기 카드 관리<br>
                      - N-gram 및 FCM·SSE 기반 실시간 알림 개발
                    </sub>
                  </td>
                  <td width="168px" valign="top">
                    <sub>
                      - 인프라 및 CI/CD 파이프라인 구축·운영 <br>
                      - ERC-721 기반 NFT 컨트랙트 개발<br>
                      - 프론트엔드 내 web3 연동
                    </sub>
                  </td>
                  <td width="168px" valign="top">
                    <sub>
                      - 딥러닝(YOLO) 기반 카드 결함 탐지 모델 개발<br>
                      - FastAPI 기반 AI 모델 서빙 서버 및 파이프라인 구축<br>
                      - 카드 시뮬레이션 UI 및 데이터 Fetching 로직 구현
                    </sub>
                  </td>
                  <td width="168px" valign="top">
                    <sub>
                      - UI/UX 디자인 총괄 및 디자인 시스템 설계 <br>
                      - TanStack Query 캐싱을 통한 프론트엔드 성능 최적화<br>
                      - 계층적 데이터 Fetching 구조(lib→hooks) 설계
                    </sub>
                  </td>
                </tr>
            </table>
        </div>  <!-- 팀구성 끝 -->
        <br>
        <br>
        <h2 align="left"><a name="techStack">🛠️ 기술 스택</a></h2>
        <div>  <!--기술스택 시작-->
          <div>
            <h3 align="left">💰 DApp</h3>
            <p align="center">
              <img alt="Solidity" src="https://img.shields.io/badge/Solidity-%23363636.svg?style=for-the-badge&logo=solidity&logoColor=white">
              <img alt="Alchemy" src="https://img.shields.io/badge/Alchemy-%23363636.svg?style=for-the-badge&logo=alchemy&logoColor=white">
              <img alt="Ethereum" src="https://img.shields.io/badge/Ethereum-3C3C3D?style=for-the-badge&logo=Ethereum&logoColor=white">
              <img alt="VSCode" src="https://img.shields.io/badge/Visual%20Studio%20Code-0078d7.svg?style=for-the-badge&logo=visual-studio-code&logoColor=white"/>
              <br>
              <img alt="Web3j" src="https://img.shields.io/badge/web3j-F16822?style=for-the-badge&logo=Ethereum&logoColor=white">
              <img alt="OpenZeppelin" src="https://img.shields.io/badge/OpenZeppelin-4E5EE4?logo=OpenZeppelin&logoColor=fff&style=for-the-badge">
              <img alt="ethers.js" src="https://img.shields.io/badge/ethers.js-0078d7.svg?style=for-the-badge&logo=Ethers&logoColor=white"/>
              <img alt="web3-react" src="https://img.shields.io/badge/Web3%20React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"/>
            </p>
            <table style="width:100%; table-layout: fixed;">
              <thead>
                <tr><th style="width:25%;">구분</th><th>사용 기술</th></tr>
              </thead>
              <tbody>
                <tr><td><strong>Language</strong></td><td>Solidity</td></tr>
                <tr><td><strong>Blockchain</strong></td><td>Ethereum (Sepolia Testnet), Alchemy</td></tr>
                <tr><td><strong>Framework & Tools</strong></td><td>Hardhat 2.26.3</td></tr>
                <tr><td><strong>Library</strong></td><td><ul><li><strong>Smart Contract</strong>: OpenZepplin 5.4.0</li><li><strong>BE-Integration</strong>: Web3j 4.13.0</li><li><strong>FE-Integration</strong>: Metamask 22.1.1, Ethers.js 6.15.0, web3-react ^8.2.3</li></ul></td></tr>
                <tr><td><strong>IDE</strong></td><td>Visual Studio Code 1.103.1</td></tr>
              </tbody>
            </table>
          </div>
          <hr/><br>
          <div>
            <h3 align="left">🌆 Backend</h3>
            <p align="center">
              <img alt="Java" src="https://img.shields.io/badge/java-%23ED8B00.svg?style=for-the-badge&logo=openjdk&logoColor=white">
              <img alt="Gradle" src="https://img.shields.io/badge/Gradle-02303A.svg?style=for-the-badge&logo=Gradle&logoColor=white">
              <img alt="IntelliJ IDEA" src="https://img.shields.io/badge/intellijidea-000000.svg?&style=for-the-badge&logo=intellijidea&logoColor=white">
              <img alt="VSCode" src="https://img.shields.io/badge/Visual%20Studio%20Code-0078d7.svg?style=for-the-badge&logo=visual-studio-code&logoColor=white"/>
              <br>
              <img alt="Spring Boot" src="https://img.shields.io/badge/springboot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white">
              <img alt="Spring Security" src="https://img.shields.io/badge/spring security-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white">
              <img alt="JWT" src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens">
              <br>
              <img alt="Hibernate" src="https://img.shields.io/badge/Hibernate-59666C?style=for-the-badge&logo=Hibernate&logoColor=white">
              <img alt="Web3j" src="https://img.shields.io/badge/web3j-F16822?style=for-the-badge&logo=Ethereum&logoColor=white">
              <img alt="Firebase Admin" src="https://img.shields.io/badge/firebase-ffca28?style=for-the-badge&logo=firebase&logoColor=black">
              <img alt="Swagger" src="https://img.shields.io/badge/-Swagger-%23Clojure?style=for-the-badge&logo=swagger&logoColor=white">
              <br>
              <img alt="MySQL" src="https://img.shields.io/badge/mysql-4479A1?style=for-the-badge&logo=mysql&logoColor=white">
              <img alt="Redis" src="https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white">
            </p>
            <table style="width:100%; table-layout: fixed;">
              <thead>
                <tr><th style="width:25%;">구분</th><th>사용 기술</th></tr>
              </thead>
              <tbody>
                <tr><td><strong>Language</strong></td><td>Java 17</td></tr>
                <tr><td><strong>Framework</strong></td><td>Spring Boot 3.5.5</td></tr>
                <tr><td><strong>Library</strong></td><td>Spring Validation, Spring Data JPA, Spring Data Redis, Spring Security, Spring Mail, Spring Dotenv 3.0.0, Spring Test, Spring AWS S3, Firebase Admin (FCM) 9.1.1, QueryDSL 5.0.0, Web3j 4.13.0, JWT (Java JWT) 0.12.6, Scrimage 4.0.32</td></tr>
                <tr><td><strong>Database</strong></td><td>MySQL 8.0.43, Redis 8.0.3</td></tr>
                <tr><td><strong>IDE</strong></td><td>IntelliJ IDEA 2025.1.3 (Ultimate Edition), Visual Studio Code 1.103.1</td></tr>
                <tr><td><strong>Build Tool</strong></td><td>Gradle 8.14.3</td></tr>
              </tbody>
            </table>
          </div>
          <hr/><br>
          <div>
            <h3 align="left">🌅 Frontend</h3>
            <p align="center">
              <img alt="VSCode" src="https://img.shields.io/badge/Visual%20Studio%20Code-0078d7.svg?style=for-the-badge&logo=visual-studio-code&logoColor=white"/>
              <img alt="React" src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB"/>
              <img alt="TypeScript" src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white"/>
              <br>
              <img alt="TailwindCSS" src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white"/>
              <img alt="RadixUI" src="https://img.shields.io/badge/radix%20ui-161618.svg?style=for-the-badge&logo=radix-ui&logoColor=white"/>
              <img alt="Zustand" src="https://img.shields.io/badge/Zustand%20-443D3D?style=for-the-badge&logo=react"/>
              <img alt="TanStack React Query" src="https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white"/>
              <br>
              <img alt="Swiper.js" src="https://img.shields.io/badge/Swiper.js-6332F6?style=for-the-badge&logo=swiper"/>
              <img alt="ethers.js" src="https://img.shields.io/badge/ethers.js-0078d7.svg?style=for-the-badge&logo=Ethers&logoColor=white"/>
              <img alt="web3-react" src="https://img.shields.io/badge/Web3%20React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"/>
            </p>
            <table style="width:100%; table-layout: fixed;">
              <thead>
                <tr><th style="width:25%;">구분</th><th>사용 기술</th></tr>
              </thead>
              <tbody>
                <tr><td><strong>Language</strong></td><td>TypeScript 5, JavaScript</td></tr>
                <tr><td><strong>Framework</strong></td><td>Next.js 14.2.23</td></tr>
                <tr><td><strong>Library</strong></td><td><ul><li><strong>UI/Form/Data Fetch</strong>: React 18.3.1, React-Hook-Form 7.62.0, Tailwind CSS 4, Axios 1.12.2</li><li><strong>State Management</strong>: Zustand ^5.0.8, TanStack Query 5.90.1</li><li><strong>Blockchain</strong>: Metamask 22.1.1, Ethers.js 6.15.0, Web3-react ^8.2.3</li></ul></td></tr>
                <tr><td><strong>IDE</strong></td><td>Visual Studio Code 1.103.1, Cursor</td></tr>
              </tbody>
            </table>
          </div>
          <hr/><br>
          <div>
            <h3 align="left">🤖 AI</h3>
            <p align="center">
              <img alt="Python" src="https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54">
              <img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi">
              <img alt="mlflow" src="https://img.shields.io/badge/mlflow-%23d9ead3.svg?style=for-the-badge&logo=numpy&logoColor=blue">
              <img alt="VSCode" src="https://img.shields.io/badge/Visual%20Studio%20Code-0078d7.svg?style=for-the-badge&logo=visual-studio-code&logoColor=white"/>
              <br>
              <img alt="PyTorch" src="https://img.shields.io/badge/PyTorch-%23EE4C2C.svg?style=for-the-badge&logo=PyTorch&logoColor=white">
              <img alt="OpenCV" src="https://img.shields.io/badge/opencv-5C3EE8?style=for-the-badge&logo=opencv&logoColor=ffdd54">
              <img alt="Gunicorn" src="https://img.shields.io/badge/gunicorn-%298729.svg?style=for-the-badge&logo=gunicorn&logoColor=white">
              <img alt="NumPy" src="https://img.shields.io/badge/numpy-%23013243.svg?style=for-the-badge&logo=numpy&logoColor=white">
            </p>
            <table style="width:100%; table-layout: fixed;">
              <thead>
                <tr><th style="width:25%;">구분</th><th>사용 기술</th></tr>
              </thead>
              <tbody>
                <tr><td><strong>Language</strong></td><td>Python 3.10.11</td></tr>
                <tr><td><strong>Framework</strong></td><td>FastAPI 0.116</td></tr>
                <tr><td><strong>Library</strong></td><td>Torch 2.8, Torchvision 0.23, Ultrylytics 8.3, Mmdet 3.3.0, Pillow 11.3, Numpy 2.2, Jinja2 3.1, SQLAlchemy 2.0, Asyncmy 0.2, Contourpy 1.3, Opencv-python 4.2, PyJWT 2.10</td></tr>
                <tr><td><strong>Runtime<br>Environment</strong></td><td>Uvicorn 0.35, Gunicorn 23.0</td></tr>
                <tr><td><strong>MLOps</strong></td><td>MLflow</td></tr>
                <tr><td><strong>Model</strong></td><td>YOLOv8, YOLOv11, Faster R-CNN</td></tr>
                <tr><td><strong>IDE</strong></td><td>Visual Studio Code 1.103.1</td></tr>
              </tbody>
            </table>
          </div>
          <hr/><br>
          <div>
            <h3 align="left">🛡️ DevOps</h3>
            <p align="center">
              <img alt="Docker" src="https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white"/>
              <img alt="Jenkins" src="https://img.shields.io/badge/jenkins-%232C5263.svg?style=for-the-badge&logo=jenkins&logoColor=white">
              <img alt="Nginx" src="https://img.shields.io/badge/nginx-%23009639.svg?style=for-the-badge&logo=nginx&logoColor=white">
              <img alt="Ubuntu" src="https://img.shields.io/badge/Ubuntu-E95420?style=for-the-badge&logo=ubuntu&logoColor=white">
              <br>
              <img alt="Amazon EC2" src="https://img.shields.io/badge/amazonec2-FF9900.svg?style=for-the-badge&logo=amazonec2&logoColor=white">
              <img alt="Amazon S3" src="https://img.shields.io/badge/Amazon%20S3-FF9900?style=for-the-badge&logo=amazons3&logoColor=white">
              <img alt="Cloudflare" src="https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=Cloudflare&logoColor=white">
              <br>
              <img alt="Grafana" src="https://img.shields.io/badge/grafana-%23F46800.svg?style=for-the-badge&logo=grafana&logoColor=white">
              <img alt="Prometheus" src="https://img.shields.io/badge/Prometheus-E6522C?style=for-the-badge&logo=Prometheus&logoColor=white">
            </p>
            <table style="width:100%; table-layout: fixed;">
              <thead>
                <tr><th style="width:25%;">구분</th><th>사용 기술</th></tr>
              </thead>
              <tbody>
                <tr><td><strong>Operating System</strong></td><td>Ubuntu 22.04.5 LTS (Jammy)</td></tr>
                <tr><td><strong>Instance Type</strong></td><td>T2.XLARGE</td></tr>
                <tr><td><strong>CPU</strong></td><td>4 vCPUs</td></tr>
                <tr><td><strong>RAM</strong></td><td>16 GB</td></tr>
                <tr><td><strong>Storage</strong></td><td>SSD: 320 GB, HDD: 6 TB</td></tr>
                <tr><td><strong>Docker</strong></td><td>28.4.0</td></tr>
                <tr><td><strong>Docker Compose</strong></td><td>2.39.2</td></tr>
                <tr><td><strong>Web Server</strong></td><td>Nginx 1.27</td></tr>
                <tr><td><strong>CI/CD</strong></td><td>Jenkins 2.516.2</td></tr>
                <tr><td><strong>Monitoring</strong></td><td>Grafana 12.1.1, Prometheus 3.5.0<br>(Node Exporter 1.9.1, cAdvisor 1.2.1, Alertmanager 0.28.1)</td></tr>
                <tr><td><strong>webhook handler</strong></td><td>Jenkins Groovy 2.479.1</td></tr>
              </tbody>
            </table>
          </div>
          <hr/><br>
          <div>
            <h3 align="left">🤝 Collaboration</h3>
            <p align="center">
              <img alt="Git" src="https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white">
              <img alt="GitLab" src="https://img.shields.io/badge/gitlab-%23181717.svg?style=for-the-badge&logo=gitlab&logoColor=white">
              <img alt="Figma" src="https://img.shields.io/badge/figma-%23F24E1E.svg?style=for-the-badge&logo=figma&logoColor=white">
              <br>
              <img alt="Notion" src="https://img.shields.io/badge/notion-000000.svg?style=for-the-badge&logo=notion&logoColor=white">
              <img alt="Discord" src="https://img.shields.io/badge/Discord-%235865F2.svg?style=for-the-badge&logo=discord&logoColor=white">
              <img alt="Jira" src="https://img.shields.io/badge/jira-%230A0FFF.svg?style=for-the-badge&logo=jira&logoColor=white">
            </p>
          </div>
        </div> <!--기술스택 끝-->
        <br><br>
        </div>
        <h2 align="left"><a name="ciCd">🖧 CI/CD</a></h2>
        <div>
          <h3 align="left">🌐 System Architecture</h3>
          <img src="./readme-assets/system-architecture.png" width="90%" align=center/>
        </div>
        <br>
        <div>
          <h3 align="left">🔔 Real-time CI/CD & Project Event Alerts</h3>
<div align="center">
  <table align="center">
  <tbody>
    <tr>
      <td align="center" width="50%"><b>✅ Jenkins Pipeline Success</b></td>
      <td align="center" width="50%"><b>❌ Jenkins Pipeline Failure</b></td>
    </tr>
    <tr>
      <td align="center"><img src="./readme-assets/jenkins_pipeline_success.gif"/></td>
      <td align="center"><img src="./readme-assets/jenkins_pipeline_failure.gif"/></td>
    </tr>
    <tr>
      <td align="center" width="50%"><b>🔀 Merge Request Created Notification</b></td>
      <td align="center" width="50%"><b>🗨️ Jira Issue Notification</b></td>
    </tr>
    <tr>
      <td align="center"><img src="./readme-assets/merge_request_created_notification.gif"/></td>
      <td align="center"><img src="./readme-assets/jira_issue_notification.gif"/></td>
    </tr>
    <tr>
      <td align="center" width="50%"><b>🚨 CPU Anomaly Detected</b></td>
      <td align="center" width="50%"><b>🚨 Memory Anomaly Detected</b></td>
    </tr>
    <tr>
      <td align="center"><img src="./readme-assets/CPU_anomaly_detected.png"/></td>
      <td align="center"><img src="./readme-assets/memory_anomaly_detected.png"/></td>
    </tr>
    <tr>
      <td align="center" width="50%"><b>✅ CPU Anomaly Cleared</b></td>
      <td align="center" width="50%"><b>✅ Memory Anomaly Cleared</b></td>
    </tr>
    <tr>
      <td align="center"><img src="./readme-assets/CPU_anomaly_cleared.gif"/></td>
      <td align="center"><img src="./readme-assets/memory_anomaly_cleared.gif"/></td>
    </tr>
  </tbody>
  </table>
</div>
        </div>
        <br><br>
        <h2 align="left"><a name="keyFeatures">🌠 주요 기능</a></h2>
<div align="center">
<table>
<tbody align="center"> 
    <tr> <th style="text-align: center"> 메인화면 </th> <th style="text-align: center"> 회원가입/로그인 </th> </tr>
    <tr> <td width="50%"><img width="100%" src="./readme-assets/feature/1_main.gif"/></td> 
        <td width="50%"><img width="100%" src="./readme-assets/feature/2_signup.gif"/></td> </tr> </tbody>
<tbody align="center"> 
    <tr> <th style="text-align: center"> 메타마스크 지갑 연동 </th> <th style="text-align: center"> 경매 정보 조회 </th> </tr>
    <tr> <td width="50%"><img width="100%" src="./readme-assets/feature/3_wallet.gif"/></td> 
        <td width="50%"><img width="100%" src="./readme-assets/feature/4_auction.gif"/></td> </tr> </tbody>
<tbody align="center"> 
    <tr> <th style="text-align: center"> 카드 별 경매 정보 조회 </th> <th style="text-align: center"> 판매자 경매 등록 </th> </tr>
    <tr> <td width="50%"><img width="100%" src="./readme-assets/feature/5_card.gif"/></td> 
        <td width="50%"><img width="100%" src="./readme-assets/feature/6_create_auction.gif"/></td> </tr> </tbody>
<tbody align="center"> 
    <tr> <th style="text-align: center"> 경매 상세 정보 조회 </th> <th style="text-align: center"> NFT 거래 이력 조회 </th> </tr>
    <tr> <td width="50%"><img width="100%" src="./readme-assets/feature/7_auction_detail.gif"/></td> 
        <td width="50%"><img width="100%" src="./readme-assets/feature/8_nft_history.gif"/></td> </tr> </tbody>
<tbody align="center"> 
    <tr> <th style="text-align: center"> 문의 등록 </th> <th style="text-align: center"> 입찰 </th> </tr>
    <tr> <td width="50%"><img width="100%" src="./readme-assets/feature/9_inquiry.gif"/></td> 
        <td width="50%"><img width="100%" src="./readme-assets/feature/10_bid.gif"/></td> </tr> </tbody>
<tbody align="center"> 
    <tr> <th style="text-align: center"> 입찰 내역 조회 </th> <th style="text-align: center"> 판매 내역 조회 </th> </tr>
    <tr> <td width="50%"><img width="100%" src="./readme-assets/feature/11_bid_list.gif"/></td> 
        <td width="50%"><img width="100%" src="./readme-assets/feature/12_sell_list.gif"/></td> </tr> </tbody>
<tbody align="center"> 
    <tr> <th style="text-align: center"> 관심 카드/경매 조회 </th> <th style="text-align: center"> 판매자 배송 정보 등록 </th> </tr>
    <tr> <td width="50%"><img width="100%" src="./readme-assets/feature/13_interest_card.gif"/></td> 
        <td width="50%"><img width="100%" src="./readme-assets/feature/14_seller_delivery.gif"/></td> </tr> </tbody>
<tbody align="center"> 
    <tr> <th style="text-align: center"> 판매자 대금 인출 </th> <th style="text-align: center"> 판매자 상점 </th> </tr>
    <tr> <td width="50%"><img width="100%" src="./readme-assets/feature/15_seller_withdraw.gif"/></td> 
        <td width="50%"><img width="100%" src="./readme-assets/feature/16_seller_store.gif"/></td> </tr> </tbody>
<tbody align="center"> 
    <tr> <th style="text-align: center"> 알림함/실시간 FCM 알림 </th> <th style="text-align: center">  </th> </tr>
    <tr> <td width="50%"><img width="100%" src="./readme-assets/feature/17_notification.gif"/></td> 
        <td width="50%"></tbody>
</table>
</div>
        <br><br>
                <h2 align="left"><a name="directories">📂 디렉터리 구조</a></h2>
        <div>
          <details align="left">
            <summary>
              <strong>🌅 Frontend Web</strong>
            </summary>
            <pre><code>
📁 frontend-web
   └─ 📁 taako
      ├─ 📝 .dockerignore
      ├─ 📝 .gitignore
      ├─ 📝 next.config.js
      ├─ 📝 package.json
      ├─ 📝 README.md
      ├─ 📝 tsconfig.json
      ├─ 📁 .vscode
      │  └─ 📝 settings.json
      ├─ 📁 app
      │  ├─ 📝 error.tsx
      │  ├─ 📝 globals.css
      │  ├─ 📝 layout.tsx
      │  ├─ 📝 not-found.tsx
      │  ├─ 📝 page.tsx
      │  ├─ 📁 admin
      │  │  ├─ 📝 layout.tsx
      │  │  └─ 📝 page.tsx
      │  ├─ 📁 login
      │  │  ├─ 📝 LoginForm.tsx
      │  │  └─ 📝 page.tsx
      │  ├─ 📁 mypage
      │  │  ├─ 📝 layout.tsx
      │  │  └─ 📝 page.tsx
      │  └─ 📁 ... (other routes)
      ├─ 📁 components
      │  ├─ 📝 Footer.tsx
      │  ├─ 📝 Loading.tsx
      │  ├─ 📁 header
      │  ├─ 📁 cards
      │  ├─ 📁 modals
      │  └─ 📁 ... (other component groups)
      ├─ 📁 hooks
      │  ├─ 📝 useMyInfo.ts
      │  ├─ 📝 useAuctionsQuery.ts
      │  └─ 📝 useWallet.ts
      ├─ 📁 lib
      │  ├─ 📝 api.ts
      │  ├─ 📝 utils.ts
      │  ├─ 📝 firebase.ts
      │  └─ 📁 auth
      ├─ 📁 public
      │  ├─ 📝 logo.png
      │  ├─ 📝 vercel.svg
      │  ├─ 📁 icon
      │  └─ 📁 img
      ├─ 📁 scripts
      │  └─ 📝 generate-firebase-sw.cjs
      ├─ 📁 stores
      │  ├─ 📝 useAuthStore.ts
      │  └─ 📝 useOverlaySpin.ts
      ├─ 📁 styles
      │  └─ 📝 index.css
      └─ 📁 types
         ├─ 📝 auction.ts
         ├─ 📝 user.ts
         └─ 📝 card.ts
            </code></pre>
            </details>
            <details align="left">
            <summary>
            <strong>🌆 Backend Spring</strong>
            </summary>
            <pre><code>
📁 backend-spring
 ├─ 📝 .dockerignore
 ├─ 📝 .gitattributes
 ├─ 📝 .gitignore
 ├─ 📝 build.gradle
 ├─ 📝 Dockerfile
 ├─ 📝 gradlew
 ├─ 📝 gradlew.bat
 ├─ 📝 settings.gradle
 ├─ 📁 codegen
 │  ├─ 📝 AuctionEscrow.abi
 │  ├─ 📝 AuctionFactory.abi
 │  └─ 📝 TakoCardNFT.abi
 ├─ 📁 gradle
 └─ 📁 src
     ├─ 📁 main
     │  ├─ 📁 java
     │  │  └─ 📁 com
     │  │      └─ 📁 bukadong
     │  │          └─ 📁 tcg
     │  │              ├─ 📝 TcgApplication.java
     │  │              ├─ 📁 api
     │  │              │  ├─ 📁 admin
     │  │              │  │  ├─ 📁 auction
     │  │              │  │  ├─ 📁 blockchain
     │  │              │  │  ├─ 📁 card
     │  │              │  │  ├─ 📁 category
     │  │              │  │  ├─ 📁 common
     │  │              │  │  ├─ 📁 fcm
     │  │              │  │  └─ 📁 notice
     │  │              │  ├─ 📁 auction
     │  │              │  │  ├─ 📁 bootstrap
     │  │              │  │  ├─ 📁 controller
     │  │              │  │  ├─ 📁 converter
     │  │              │  │  ├─ 📁 dto
     │  │              │  │  ├─ 📁 entity
     │  │              │  │  ├─ 📁 event
     │  │              │  │  ├─ 📁 listener
     │  │              │  │  ├─ 📁 repository
     │  │              │  │  ├─ 📁 scheduler
     │  │              │  │  ├─ 📁 service
     │  │              │  │  ├─ 📁 sse
     │  │              │  │  └─ 📁 util
     │  │              │  ├─ 📁 auth
     │  │              │  │  ├─ 📁 controller
     │  │              │  │  ├─ 📁 dto
     │  │              │  │  └─ 📁 service
     │  │              │  ├─ 📁 bid
     │  │              │  │  ├─ 📁 config
     │  │              │  │  ├─ 📁 controller
     │  │              │  │  ├─ 📁 converter
     │  │              │  │  ├─ 📁 dto
     │  │              │  │  ├─ 📁 entity
     │  │              │  │  ├─ 📁 repository
     │  │              │  │  ├─ 📁 service
     │  │              │  │  └─ 📁 util
     │  │              │  ├─ 📁 card
     │  │              │  │  ├─ 📁 controller
     │  │              │  │  ├─ 📁 dto
     │  │              │  │  ├─ 📁 entity
     │  │              │  │  ├─ 📁 repository
     │  │              │  │  ├─ 📁 service
     │  │              │  │  └─ 📁 util
     │  │              │  ├─ 📁 category
     │  │              │  │  ├─ 📁 controller
     │  │              │  │  ├─ 📁 dto
     │  │              │  │  ├─ 📁 entity
     │  │              │  │  ├─ 📁 repository
     │  │              │  │  └─ 📁 service
     │  │              │  ├─ 📁 delivery
     │  │              │  │  ├─ 📁 controller
     │  │              │  │  ├─ 📁 dto
     │  │              │  │  ├─ 📁 entity
     │  │              │  │  ├─ 📁 repository
     │  │              │  │  ├─ 📁 scheduler
     │  │              │  │  └─ 📁 service
     │  │              │  ├─ 📁 fcm
     │  │              │  │  ├─ 📁 config
     │  │              │  │  ├─ 📁 controller
     │  │              │  │  ├─ 📁 dto
     │  │              │  │  ├─ 📁 entity
     │  │              │  │  ├─ 📁 repository
     │  │              │  │  └─ 📁 service
     │  │              │  ├─ 📁 game
     │  │              │  │  └─ 📁 entity
     │  │              │  ├─ 📁 health
     │  │              │  ├─ 📁 inquiry
     │  │              │  │  ├─ 📁 controller
     │  │              │  │  ├─ 📁 dto
     │  │              │  │  ├─ 📁 entity
     │  │              │  │  ├─ 📁 repository
     │  │              │  │  ├─ 📁 service
     │  │              │  │  └─ 📁 util
     │  │              │  ├─ 📁 media
     │  │              │  │  ├─ 📁 config
     │  │              │  │  ├─ 📁 controller
     │  │              │  │  ├─ 📁 dto
     │  │              │  │  ├─ 📁 entity
     │  │              │  │  ├─ 📁 guard
     │  │              │  │  ├─ 📁 policy
     │  │              │  │  ├─ 📁 repository
     │  │              │  │  ├─ 📁 service
     │  │              │  │  └─ 📁 util
     │  │              │  ├─ 📁 member
     │  │              │  │  ├─ 📁 controller
     │  │              │  │  ├─ 📁 dto
     │  │              │  │  ├─ 📁 entity
     │  │              │  │  ├─ 📁 repository
     │  │              │  │  └─ 📁 service
     │  │              │  ├─ 📁 notice
     │  │              │  │  ├─ 📁 controller
     │  │              │  │  ├─ 📁 dto
     │  │              │  │  ├─ 📁 entity
     │  │              │  │  ├─ 📁 repository
     │  │              │  │  └─ 📁 service
     │  │              │  ├─ 📁 notification
     │  │              │  │  ├─ 📁 config
     │  │              │  │  ├─ 📁 controller
     │  │              │  │  ├─ 📁 dto
     │  │              │  │  ├─ 📁 entity
     │  │              │  │  ├─ 📁 event
     │  │              │  │  ├─ 📁 repository
     │  │              │  │  ├─ 📁 service
     │  │              │  │  ├─ 📁 sse
     │  │              │  │  └─ 📁 util
     │  │              │  ├─ 📁 popularity
     │  │              │  │  ├─ 📁 aop
     │  │              │  │  ├─ 📁 config
     │  │              │  │  ├─ 📁 controller
     │  │              │  │  ├─ 📁 dto
     │  │              │  │  ├─ 📁 service
     │  │              │  │  └─ 📁 util
     │  │              │  ├─ 📁 push
     │  │              │  │  └─ 📁 entity
     │  │              │  ├─ 📁 test
     │  │              │  ├─ 📁 trade
     │  │              │  │  ├─ 📁 entity
     │  │              │  │  └─ 📁 repository
     │  │              │  ├─ 📁 trust
     │  │              │  │  ├─ 📁 controller
     │  │              │  │  ├─ 📁 entity
     │  │              │  │  ├─ 📁 repository
     │  │              │  │  └─ 📁 service
     │  │              │  └─ 📁 wish
     │  │              │      ├─ 📁 controller
     │  │              │      ├─ 📁 dto
     │  │              │      ├─ 📁 entity
     │  │              │      ├─ 📁 repository
     │  │              │      └─ 📁 service
     │  │              └─ 📁 global
     │  │                  ├─ 📁 batch
     │  │                  │  ├─ 📁 config
     │  │                  │  ├─ 📁 controller
     │  │                  │  ├─ 📁 job
     │  │                  │  └─ 📁 schedule
     │  │                  ├─ 📁 blockchain
     │  │                  │  ├─ 📁 constants
     │  │                  │  ├─ 📁 contracts
     │  │                  │  ├─ 📁 event
     │  │                  │  ├─ 📁 listener
     │  │                  │  ├─ 📁 service
     │  │                  │  └─ 📁 util
     │  │                  ├─ 📁 common
     │  │                  │  ├─ 📁 base
     │  │                  │  ├─ 📁 dto
     │  │                  │  └─ 📁 exception
     │  │                  ├─ 📁 config
     │  │                  ├─ 📁 constant
     │  │                  ├─ 📁 mail
     │  │                  │  ├─ 📁 constants
     │  │                  │  ├─ 📁 dto
     │  │                  │  ├─ 📁 provider
     │  │                  │  └─ 📁 service
     │  │                  ├─ 📁 properties
     │  │                  │  └─ 📁 blockchain
     │  │                  ├─ 📁 security
     │  │                  │  ├─ 📁 config
     │  │                  │  ├─ 📁 dto
     │  │                  │  ├─ 📁 filter
     │  │                  │  ├─ 📁 handler
     │  │                  │  └─ 📁 provider
     │  │                  └─ 📁 util
     │  └─ 📁 resources
     │      ├─ 📝 application.yml
     │      ├─ 📝 logback-spring.xml
     │      └─ 📁 firebase
     │          └─ 📝 tcg-auction-fcm.json
     └─ 📁 test
            </code></pre>
            </details>
            <details align="left">
            <summary>
            <strong>🤖 Backend FastAPI</strong>
            </summary>
            <pre><code>
📁 backend-fastapi
 ├─ 📝 .gitignore
 ├─ 📝 .gitkeep
 ├─ 📝 Dockerfile
 ├─ 📝 main.py
 ├─ 📝 requirements.txt
 ├─ 📝 ws.py
 └─ 📁 models
     ├─ 📝 card_defect_detection.pt
     ├─ 📝 card_segmentation.pt
     └─ 📝 card_verification.pt
            </code></pre>
            </details>
            <details align="left">
            <summary>
            <strong>💰 DApp</strong>
            </summary>
              <pre><code>
📁 backend-solidity
 ├─ 📁 contracts
 │  ├─ 📝 AuctionEscrow.sol
 │  ├─ 📝 AuctionFactory.sol
 │  ├─ 📝 TakoCardNFT.sol
 │  └─ 📝 Lock.sol
 ├─ 📁 scripts        
 ├─ 📁 test          
 ├─ 📁 ignition
 │  └─ 📁 modules     
 ├─ 📁 .openzeppelin  
 ├─ 📝 hardhat.config.ts   
 ├─ 📝 package.json        
 └─ 📝 tsconfig.json
              </code></pre>
            </details>
        </div>  
        <br><br>
        <h2 align="left"><a name="projectDeliverables">📦 프로젝트 산출물</a></h2>
        <div>
          <div>
            <h3 align="left">🖼️ 화면 설계서</h3>
            <img src="./readme-assets/figma.png" width="90%" align=center/>
          </div>
          <br>
          <div>
            <a href="https://www.erdcloud.com/d/tDvcSxnGakBcKAsEN" target="_blank">
            <h3 align="left">🗄️ ERD</h3>
            <img src="./readme-assets/erd.png" width="90%" align=center/>
            </a>
          </div>
          <br>
          <div>
            <h3 align="left">✅ Swagger API Docs</h3>
            <details align="left">
            <summary>
              <strong>🌆 Backend Spring</strong>
            </summary>
            <div align=center>
              <a href="https://api.tako.today/swagger-ui/index.html" target="_blank">
              <img src="./readme-assets/backend_spring_api.png" width="90%" align=center/></a><br>
            </div>
            </details>
            <br>
            <details align="left">
            <summary>
              <strong>🤖 Backend FastAPI</strong>
            </summary>
            <div align=center>
              <a href="https://tako.today/ai/docs#/" target="_blank">
              <img src="./readme-assets/backend_fastapi_api.png" width="90%" align=center/></a><br>
            </div>
            </details>
          </div>
          <br>
          <h3 align="left">📅 Jira Issues</h3>
          <details align="left">
          <summary>
            <strong>Details</strong>
          </summary>
          <div align=center>
            <img src="./readme-assets/jira_sprint.png" width="90%" align=center/>
          </div>
          </details>
          <br>
          <a href="https://www.notion.so/25f7dcd980dd803d953ff2df439d5d7f?v=25f7dcd980dd804da024000c620b205a&source=copy_link" target="_blank">
          <h3 align="left">📋 기능 명세서</h3></a>
          <details align="left">
          <summary>
            <strong>Details</strong>
          </summary>
          <div align=center>
            <a href=https://www.notion.so/25f7dcd980dd803d953ff2df439d5d7f?v=25f7dcd980dd804da024000c620b205a&source=copy_link" target="_blank">
          <img src="./readme-assets/feature.png" width="90%" align=center/></a>
          </div>
          </details>
          <br>
          <a href="https://www.notion.so/2677dcd980dd81029f6cf2d054b5ad15?v=2677dcd980dd81e3b392000ca591ecfd&source=copy_link" target="_blank">
          <h3 align="left">📡 API 명세서</h3></a>
          <details align="left">
          <summary>
            <strong>Details</strong>
          </summary>
          <div align=center>
            <a href="https://www.notion.so/2677dcd980dd81029f6cf2d054b5ad15?v=2677dcd980dd81e3b392000ca591ecfd&source=copy_link" target="_blank">
          <img src="./readme-assets/api.png" width="90%" align=center/></a>
          </div>
          </details>
          <br>
        </div>
        <br><br>
</div> <!--전체 넓이!! 지우면 X-->
</div>
