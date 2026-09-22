# Kossan OQC — 프로젝트 지침 v4

이 문서는 새 대화창(Claude Project)에서 이어서 작업할 때 맥락을 빠르게 잡기 위한 것입니다.
**v4 변경점**: v1.0 안정화 완료 (DEV→MAIN 전체 반영). 주요 변경: KV 구조 개편(schedule/map 분리),
assembleShipments, collectMaps 개선, etaActual 판정 강화, BOOKED 뱃지, STALE 12시간 기준,
Not Departed 조건, CARTO API 키, Smart Placement 활성화, DEV/MAIN 환경 완전 분리.

---

## 1. 무엇을 만들고 있나

HMM(현대상선) 부킹 화물의 **실시간 위치·일정 추적 + 지연 조기 경보** 사이트,
그리고 **니트릴 장갑 COA(품질검사성적서) 관제 대시보드**.

- 본사이트: `https://donghoon2661-prog.github.io/q-report/`
- DEV 사이트: `https://donghoon2661-prog.github.io/q-report-dev/`
- 본사이트 Worker: `https://kossan-oqc.dhoqc.workers.dev`
- DEV Worker: `https://kossan-oqc-dev.dhoqc.workers.dev`

---

## 2. 파일 구조 (v4 기준)

| 파일 | 역할 | 변경 빈도 |
|---|---|---|
| `index.html` | 뼈대 HTML + 스크립트 로드 | 구조 변경 시만 |
| `style.css` | 다크/라이트 테마 포함 전체 CSS | 디자인 요청 시 |
| `config.js` | API_ROOT, TILE, DELAY 상수 등 공통 설정 | 환경 변경 시 |
| `app.js` | SHIPMENT STATUS 전체 로직 | 기능 요청 대부분 여기 |
| `system.js` | SYSTEM 탭 전용 로직 | SYSTEM 관련 시 |
| `history.js` | HISTORY 탭 전용 로직 | HISTORY 관련 시 |
| `trend.js` | BETA 탭 전용 로직 | BETA 관련 시 |
| `map.js` | 지도 렌더링 전용 로직 | 지도 관련 시 |
| `po.js` | PO 매핑 전용 로직 | PO 관련 시 |
| `quality.js` | QUALITY ANALYSIS 로직 (i18n 포함) | COA 관련 시 |
| `worker.js` | Cloudflare Worker (서버) | HMM/수집/알림 로직 변경 시 |

---

## 3. 역할별 로그인

| 비밀번호 | 권한 |
|---|---|
| `admin` | 전체 접근 + SYSTEM 탭 + RESTORE + MAPPING + Add booking |
| `kossan` | 전체 접근 (SYSTEM/RESTORE/MAPPING/Add 없음) |
| `eta` | SHIPMENT STATUS만, 메뉴 화면 없이 바로 진입 |
| `qc` | QUALITY ANALYSIS만, 메뉴 화면 없이 바로 진입 |

---

## 4. SHIPMENT STATUS 주요 기능

### 탭 구성
- **MAP** / **LIST** / **HISTORY** / **BETA** / **SYSTEM** (admin 전용)

### actual 판단 로직 (v4 수정)
시간 경과로 actual 판단하지 않는다. **오직 이벤트 기반**:

| 필드 | actual 조건 |
|---|---|
| `polDepActual` | "Departure from POL" / "Feeder Loading at POL" |
| `tsArrActual` | "Arrival at T/S" / "Feeder Arrival at T/S" |
| `tsDepActual` | "Departure from T/S" |
| `etaActual` | **"Discharged at POD"만** (v4 변경: BERTHING/ARRIVAL 제외) |

**핵심 변경**: `etaActual`이 `DISCHARG+POD` 이벤트가 있을 때만 `true`. BERTHING/ARRIVAL만으로는 안 됨.
이유: 접안(BERTHING)만으로 cron 조회를 멈추면 실제 하역 이벤트를 영원히 못 잡음.

### 뱃지 (v4 신규)
- **BOOKED** (파란색): `spDep` 없고 `etaActual` 아닌 부킹 — 출발 전 상태
- **AT SEA** (초록): 항해 중
- **BERTHED** / **AT T/S PORT** (노란색): 환적항 접안
- **ARRIVED** (회색): 도착 완료 (`etaActual: true`)

### STALE 표시 기준 (v4 변경)
`scheduleCheckedAt` 기준 **12시간 이내**면 STALE 숨김. 12시간 초과 시만 표시.
(`staleItem: true`여도 최근 성공 데이터가 있으면 ok로 표시)

### Not Departed 지도 조건 (v4 신규)
`spDep`(Gate In) 없는 부킹은 지도 수집 안 함. MAP 컬럼에 `No Map (Not Departed)` 표시.

### SYSTEM 탭 에러 표시 형식 (v4 신규)
- `520 ERR (HKG) 20:17` — 지도 조회 실패
- `SESSION ERR (DEN) 09:27` — 세션 페이지 실패
- RESULT 카운트: `scheduleCheckedAt` 12시간 기준 실시간 반영

---

## 5. Worker 아키텍처 (worker.js, v4 개편)

### Cloudflare Placement 설정
- **Smart Placement** 활성화 (v4 변경)
- HMM 서버 기준 최적 엣지 자동 선택
- ICN(서울), NRT(도쿄) 등 아시아 엣지로 라우팅

### KV 구조 및 데이터 흐름 (v4 핵심 개편)

```
bookings          부킹번호 목록 (원본)
schedule:{bkg}    스케줄 데이터 원본 (collectSchedule이 저장)
map:{bkg}         지도 데이터 원본 (collectMaps이 저장)
shipments         캐시용 스냅샷 (collectSchedule이 저장, /data fallback용)
history           스케줄 변경 이력
poeta             PO ETA 원본 계획일
pomap             PO 매핑
delayHistory:*    완료 화물 지연 이력 (월별)
alertstate        알림 상태
lastrun           마지막 수집 결과
sessionLog        세션별 조회 로그 (최근 200건)
cursor            cron cursor
```

**데이터 흐름:**
```
collectSchedule → schedule:{bkg} 먼저 저장 → shipments 캐시 저장
collectMaps     → map:{bkg}만 저장 (shipments 절대 건드리지 않음)
/data           → assembleShipments: bookings → schedule:{bkg} + map:{bkg} 조립 반환
/lookup         → schedule:{bkg} 먼저 저장 성공 후 bookings 등록
```

**핵심 원칙:**
- `shipments`는 캐시용. 진짜 원본은 `schedule:{bkg}`, `map:{bkg}`
- `collectMaps`가 `shipments`를 절대 덮어쓰지 않음 → stale 데이터 복원 버그 해소

### backup/restore (v4 개선)
- backup: `schedule:{bkg}`, `map:{bkg}`, `delayHistory:*` 전부 포함 (cursor pagination)
- restore: 동일하게 전부 복원

### delayHistory & 부킹 자동 삭제
- `etaActual: true` + `delaySnapshotDone: true` → `delayCompletedAt` 기록
- `delayCompletedAt` 기준 **3일 유예** 후 `bookings`에서 자동 제거
- HISTORY 탭에 영구 기록 유지

### normalizeOne 공통 함수 (v4 신규)
`/lookup`과 `collectSchedule` 공통 normalize 경로:
delay/alert/rollover/actualFlags 판정을 한 곳에서 처리

### 엔드포인트 전체
```
GET  /data                assembleShipments: bookings 기준 조립 반환
GET  /lookup?bkg=         새 부킹 즉시 조회 + schedule:{bkg} 저장 + bookings 등록
GET  /bookings            추적 목록 조회
POST /bookings            목록 교체 (X-Refresh-Key)
GET  /po                  PO/원스케줄/사진 매핑 조회
POST /po                  매핑 저장 (X-Refresh-Key)
GET  /history[?bkg=]      스케줄 변경 이력
GET  /delayhistory        완료 화물 지연 이력 (cursor pagination)
GET  /alertstate          마지막 알림 상태
POST /collect             전체 수집 (X-Refresh-Key)
POST /collect?maps=1      지도 좌표만 수집 (X-Refresh-Key)
GET  /backup              KV 전체 스냅샷 (schedule/map 포함)
POST /restore             백업에서 복원 (X-Refresh-Key)
GET  /raw?bkg=            원본 응답 진단
GET  /debug               접속 진단 (lastrun, sessionLog)
```

---

## 6. 데이터 모델 — shipment 객체 (v4 추가 필드)

```
spDep             Gate In 시각 (Shipment Progress 파싱)
spArr             Arrival at Destination 시각
polDepActual      이벤트 기반 actual 플래그
tsArrActual       이벤트 기반 actual 플래그
tsDepActual       이벤트 기반 actual 플래그
etaActual         이벤트 기반 actual 플래그 (DISCHARG+POD만)
staleItem         마지막 조회 실패 여부
scheduleError     마지막 스케줄 조회 에러 메시지
scheduleCheckedAt 마지막 스케줄 조회 시각
mapAt             마지막 지도 수집 시각
mapError          마지막 지도 수집 에러 메시지
delaySnapshotDone delayHistory 기록 완료 여부
delayCompletedAt  하역 완료 시각 (3일 유예 카운트 기준)
planEta           PO 원본 계획 ETA
delayDays         계획 대비 지연일수
```

---

## 7. config.js 공통 상수 (v4 신규)

```javascript
const API_ROOT = "https://kossan-oqc.dhoqc.workers.dev";  // MAIN
const API = API_ROOT + "/data";
const HISTORY_API = API_ROOT + "/delayhistory";
// ... 각 엔드포인트 상수
const DELAY_WATCH_D = 3;   // Worker와 동일하게 유지
const DELAY_ALERT_D = 7;
const TILE = {
  dark: '...cartocdn.com/dark_all/...?key=cb1_2f79_1_06b086bcb2b8a0b805a1b0d6',
  light: '...cartocdn.com/light_all/...?key=cb1_2f79_1_06b086bcb2b8a0b805a1b0d6'
};
```

DEV config.js는 `API_ROOT = "https://kossan-oqc-dev.dhoqc.workers.dev"`

---

## 8. DEV → MAIN 반영 규칙 ⚠️

1. DEV 파일을 그대로 MAIN에 옮기지 않는다
2. 두 파일을 비교하여 수정 내용 제시 → Claude 1차 검증 → 대장님 2차 검토
3. 예상 RISK를 정확하게 안내
4. 안정성이 기능보다 우선
5. 컨펌 후 Claude가 MAIN 파일을 직접 수정하여 반영 (통째로 복붙 금지)

**반영 순서:**
- worker.js 먼저 배포 후 최소 5분 대기
- 프론트 파일 순서: config.js → app.js → 나머지
- 배포 후 `/data` 정상 확인 후 다음 파일 진행

**롤백 기준 (배포 후 30분 이내 판단):**
- worker.js 배포 후 `/data` 404 또는 1101 → 즉시 GitHub revert + Cloudflare 재배포
- 프론트 배포 후 화면 불량 또는 데이터 공백 → 이전 캐시 버전으로 강제 갱신
- 첫 cron에서 전체 부킹 실패 → 롤백 검토
- KV 데이터 이상 → 즉시 `/restore`로 복원 후 `/collect` 실행

---

## 9. KV 데이터 보호 원칙 ⚠️

- **KV 삭제/덮어쓰기 절대 금지**: 대장님 명시적 허락 후에만 진행
- **진단 목적의 KV 수정 절대 금지**
- **과거 사고**: shipments를 null로 덮어써서 전체 데이터 소실 (08-24 백업으로 복원)

### 1101 에러 발생 시 대응 순서
1. KV 건드리기 전에 `/data` 테스트
2. `env.OQC` undefined → deploy.yml KV 바인딩 누락 확인
3. worker 코드 버그 가능성 먼저 확인
4. KV 조작은 최후의 수단, 대장님 허락 필수

---

## 10. 백업 시스템

- GitHub Actions: **매일 KST 00:00**
- 파일명: `backup-YYYY-MM-DD.json`
- `backups/backup-latest.json` 고정 파일 동시 갱신
- 복원 항목: bookings, pomap, poeta, pophoto, history, alertstate, cursor, delayHistory:*, schedule:{bkg}, map:{bkg}
- shipments는 복원 후 `/collect`로 재수집

---

## 11. 알려진 이슈 / 주의사항 (v4)

- **Cloudflare 520 에러**: HMM이 Cloudflare 엣지 IP 간헐적 차단. Smart Placement로 완화 중. 근본 해결은 AWS 이전.
- **Map parsing failed (points 0)**: HKG 차단 해소 후 재확인 필요
- **etaActual 판정**: DISCHARG+POD만. BERTHING/ARRIVAL만으로는 cron 조회 멈추지 않음
- **spDep vs polDep**: `spDep`은 터미널 반입(Gate In), `polDep`은 피더선 출항. 다른 개념
- **CARTO API 키**: `cb1_2f79_1_06b086bcb2b8a0b805a1b0d6` (config.js TILE 상수에 포함)
- **HMM 지도 신버전**: cntrNo 없이 요청 시 routePoints 없음 → cntrNo 반드시 포함

---

## 12. UI 수정 시 주의사항 ⚠️

화면 표시 관련 수정은 렌더링 함수(renderSystemTab 등)뿐만 아니라
**이벤트 핸들러(sysMapRefreshOne 등), DOM 직접 수정 부분까지 전부** grep으로 확인 후 수정.
한 곳만 고치면 다른 곳에서 구버전 형태가 그대로 나옴.

---

## 13. 공통 원칙

- **원인 확정 전에는 코드를 고치지 않는다**
- **배포 시 안 바뀐 파일은 다시 보내지 않는다**
- **오류가 났을 때는 브라우저 Console 오류 메시지만 전달**
- `node --check`로 문법 확인 후 전달
- **"ㅎㅎ", "ㅋㅋ" 등 이모티콘/감탄사 절대 사용 금지**
- **항상 존댓말 사용**
- **URL 안내 시 절대 줄이지 말고 전체 URL 표시** (예: `https://kossan-oqc.dhoqc.workers.dev/data`)
- **KV 데이터 절대 삭제/덮어쓰기 금지**
- **GitHub에 푸시 전 대장님 허락 필수**

---

## 14. Tools & Resources

### GitHub API 패턴
```bash
# 파일 읽기 + SHA
curl -s "https://api.github.com/repos/donghoon2661-prog/q-report/contents/{file}" \
  -H "Authorization: token ghp_****MASKED****" | \
  python3 -c "import sys,json,base64; d=json.load(sys.stdin); print(d['sha']); open('/tmp/file','wb').write(base64.b64decode(d['content']))"
```

- PUT 전 반드시 SHA를 직전에 새로 fetch (stale SHA → 409 conflict)
- `node --check`로 문법 검증 후 업로드
- `style.css` 수정 시 GitHub 최신 파일 받아서 수정 후 올릴 것 — `cat >>` 방식 절대 금지

### 진단 엔드포인트
- `https://kossan-oqc.dhoqc.workers.dev/data` — 전체 shipment 상태
- `https://kossan-oqc.dhoqc.workers.dev/debug` — lastrun, sessionLog (X-Refresh-Key 필요)
- `https://kossan-oqc.dhoqc.workers.dev/raw?bkg=KULM...` — 부킹별 파싱 결과

### PowerShell KV 작업
- `curl` 대신 `Invoke-RestMethod` 사용
- KV bulk write 시 `[System.Text.Encoding]::UTF8.GetBytes($body)` 필수

---

## 15. 파일 라우팅 (권장 순서)

| 요청 내용 | 주 파일 |
|---|---|
| HMM 조회·파싱·520·cron·KV·엔드포인트·알림 | `worker.js` |
| 공통 상수·API URL·TILE·DELAY 기준 | `config.js` |
| 지도·표·경보·MAPPING·사진·부킹Add·배지·사이드패널 | `app.js` |
| SYSTEM 탭 로직 | `system.js` |
| HISTORY 탭 로직 | `history.js` |
| BETA 탭 로직 | `trend.js` |
| 지도 렌더링 | `map.js` |
| PO 매핑 | `po.js` |
| 색상·여백·다크/라이트·반응형 | `style.css` |
| 탭 추가·스크립트 로드·DOM 구조 | `index.html` |
| COA 화면 로직·i18n·차트 | `quality.js` |

---

## 16. 새 대화창 시작 템플릿

> Kossan OQC 프로젝트 v4. 구조: index.html/style.css/config.js/app.js/system.js/history.js/trend.js/map.js/po.js/quality.js(GitHub Pages) + worker.js(Cloudflare Worker, Smart Placement 활성화).
> 본사이트: https://kossan-oqc.dhoqc.workers.dev / DEV: https://kossan-oqc-dev.dhoqc.workers.dev
> 상세 지침은 PROJECT_INSTRUCTIONS_v4.md 참조. 최근 작업 이력은 18장(작업 이력/세션 로그) 참조.
> [여기에 이번에 하고 싶은 작업 설명]

---

## 17. 인터내셔널 오더 개편 계획 (v5 예정)

### 확정된 방향 (목업 승인됨)
- **MAP**: 미국(주황) / 한국(파란) / 호주(흰색) 마커 색상 구분
- **LIST**: 상단 국가 버튼(USA/Korea/Australia), 기본값 USA
- **HISTORY**: 국가별 이력 분리
- **수정 필요 파일**: `app.js`, `index.html`, `style.css`, `worker.js`

---

## 18. 작업 이력 (세션 로그)

다른 PC에서 새 대화창을 열었을 때 맥락을 빠르게 잡기 위한 기록. 세션마다 아래에 이어서 추가할 것.

### 2026-09-22 — 전체 파일 1회 순회 검수 (Claude Code)

quality.js부터 이 문서까지 전체 파일을 한 번씩 다 검수함. 발견·수정한 버그 9건(커밋 해시는 MAIN 기준, DEV도 동일 내용으로 별도 커밋):

1. `quality.js` — 언어 토글 차트 오류 등 3건 (`fc7875d`)
2. `map.js` — 리스트 선택 시 엉뚱한 배로 이동하는 markers 인덱스 버그 (`80996e9`)
3. `app.js` — gapBox() 지연 색상 기준 통일, ROUTE 합성 항로점(Pn) 표시 제외 (`ca16099`)
4. `worker.js` — weekly 메일 cron 요일 판정 정규식 오류 2→1 (`f144151`)
5. `history.js` — "PKG ETD" 열이 실제값 대신 계획값을 중복 표시 (`689934b`)
6. `worker.js` — `pickSlice()` 죽은 코드 제거 (부킹 9개 이상이면 예산 분산이 실제로 안 됐음). `newBudget` 40→200, `MAX_PER_RUN` 8→30 (`64d1d37`)
7. `system.js` — `sysRetry()`가 flat span 인덱스로 DOM 갱신 → RETRY 성공 시 vessel/voyage가 시각으로 덮어써지고 REFRESH 버튼이 사라짐. `data-role` 속성으로 수정 (`d34f420`)
8. `worker.js` — **가장 위험했던 버그**: `/restore`가 GitHub raw URL을 MAIN 저장소로 하드코딩해서, DEV Worker에서 RESTORE 쓰면 MAIN 운영 데이터가 DEV KV에 덮어써지던 크로스 오염 버그. `env.GITHUB_REPO`(wrangler.toml [vars])로 분리 (`287b8a5`)
9. `holidays.js` / `worker.js` — 같은 미국 공휴일을 서로 다른 날짜(대체공휴일 vs 실제)로 표시하던 불일치. "실제 날짜로 통일"로 결정, holidays.js 4건 수정 (`8f8ca6c`)
10. `style.css` — 8/26 rollback 커밋 흔적으로 셀렉터 없이 떠 있던 CSS 두 줄 때문에 `.sys-retry{...}` 전체가 무효 처리 → RETRY 버튼이 브라우저 기본 스타일로 렌더링. 실제 배포 사이트에서 컴퓨티드 스타일 찍어서 검증 후 수정 (`2a77a20`)
11. `index.html` — 위 수정들에 맞춰 `?v=` 캐시 버스팅 버전을 올림(안 올리면 이미 방문한 사용자 브라우저 캐시에 구버전이 남을 수 있었음) (`4c3e51d`, `2a77a20`)

**사용자가 의도적으로 보류(미수정)한 것들** — 다시 꺼내기 전엔 언급 불필요:
- app.js: `schTableHTML()`의 Loading Port Arrival 셀 중복 표시, `_caller` 죽은 디버그 변수(633번 줄), `ROLE_PW` 평문 하드코딩(내부 툴이라 허용)
- po.js: `parsePO()`의 "부킹 번호만 한 줄" 엣지케이스 — 실제 UI 사용법상 발생 불가로 판단
- calendar-public.html: `CAL_PALETTE` 20색(calendar.js는 30색), `calendarEta()` 날짜 검증 누락 — calendar.js와 드리프트, 안 고침
- manifest.json: DEV의 `start_url`/`scope`가 MAIN 경로(`/q-report/`)로 잘못됨 (PWA 설치 시 MAIN이 열림) — 사용자가 "냅두라"고 함

**정리 후보(버그 아님, 미조치)**: 루트 `COA_FNG-0310-06-16_to_07-11.json`(MAIN은 미사용/DEV는 0바이트), DEV의 `test-runner.html`, `devlog.js`(어느 index.html에도 로드 안 되는 죽은 파일)

**남은 것**: worker.js의 weekly 리포트 본문 HTML·일부 세부 엔드포인트는 구조만 확인, 라인 단위 정밀검토는 안 함. 이 문서 5장의 엔드포인트 목록도 실제보다 적음(문서 업데이트 안 함).

**다음에 할 일**: 이번 라운드는 끝났으니, 이제부터는 새로 추가/수정되는 코드 위주로 리뷰하면 됨.

