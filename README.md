# 교육용 과제 2
주어진 API를 사용하여 멋진 웹 채팅 어플리케이션을 만들어보자

<br>

## 1. 필수과제
### 1-1. 환경
**구현해야하는 환경 입니다. 아래 라이브러리를 제외한 타 라이브러리를 사용하지 마세요.**

---------------------------------
- typescript + React(혹은 PReact)
- (선택)Bootstrap
- (선택)React-Router
- (선택)Redux 같은 상태관리 라이브러리
---------------------------------

<br>

### 1-2. 화면
**구현해야하는 화면 목록입니다.**

---------------------------------
- 채팅방 진입 전 ID및 사용자명을 입력받는 화면
- 채팅방 목록 화면
- 실제로 상호간 사용가능한 채팅 화면
---------------------------------

<br>

### 1-3. 기능
**구현해야하는 기능 목록입니다.**

-------------------------------
- 로그인
   + DB에 로그인정보를 저장하지 않습니다. 기본입력창으로 입력만받고 페이지 내부에 저장하세요.
- 채팅방목록
    + DB에 채팅방목록을 저장하지 않습니다. 정적 채팅방을 생성해주세요.
- 기본 채팅기능 (텍스트채팅, 파일업로드채팅)
- 사용자 차단 및 차단 해제
- 사용자 차단목록 표출
- 현재방에 접속한 유저 리스트 노출
- (선택)유저 채팅 input 이벤트 감지
- (선택)입장시 이전 채팅정보 유지
-------------------------------

<br>

### 1-4. 규칙

1. typescript
   + any 타입 사용금지

<br>

## 2. 서버 실행방법
```bash
# package.json에 정의된 라이브러리를 다운받습니다.
npm install

# dist/index.js 파일을 실행합니다.
npm run serve
```

<br>

### 2-1. 서버 연동
```typescript
// rest api 를 요청합니다.
fetch("http://localhost:8443/block")
	.then((data) => console.log(data));

// socekt 서버와 연결합니다.
const ws = new WebSocket("ws://localhost:8444/{roomid}/{idx}/{name}");
```
```html
<!-- 서버에 업로드된 이미지를 가져옵니다. -->
<img src="http://localhost:8443/upload/test.jpg" />
```
<br>

## 3. API 목록

<br>

### 3-1. RestAPI

| URI                                | Method | Parameter                  | Header              | return                                                       |
|------------------------------------|--------|----------------------------|---------------------|--------------------------------------------------------------|
| /login                             | GET    | idx: number                |                     | { login: true \| false }                                     |
| /chatlist                          | GET    | roomid: number             |                     | [{type: string, idx: number, name: string, message: string}] |
| /userlist                          | GET    | roomid?: number            |                     | [{idx: number, name: string}]                                |
| /blocklist                         | GET    | idx: number                |                     | [{idx: number, target: number}]                              |
| /block                             | GET    | idx: number target: number |                     | {}                                                           |
| /unlock                            | GET    | idx: number target: number |                     | {}                                                           |
| /upload/(filename).(jpg\|png\|gif) | GET    |                            |                     |                                                              |
| /upload                            | POST   | file: Boolean              | multipart/form-data | {upload: string}                                             |

<br>

### 3-2. socket

| type    |   | Parameter                      | return                                             |
|---------|---|--------------------------------|----------------------------------------------------|
| write   |   | event: write                   | {type, idx: number, name: string, message: string} |
| message |   | event: message message: string |                                                    |
| unwrite |   | event: unwrite                 |                                                    |
| open    |   |                                |                                                    |
| close   |   |                                |                                                    |

<br>

## 4. 제출방식
-----------------------------
- 비공개 깃프로젝트 생성 후 프론트 담당자를 초대해주세요.
- 퇴근전에는 반드시 금일 작업내용을 remote 에 올려주세요.
- 최종완성본은 일정에 따라 코드리뷰가 진행될 예정입니다.