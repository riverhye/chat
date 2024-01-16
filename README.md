# Chat
- react와 socket으로 만든 채팅 프로그램

## 개발 환경
### Front
<img src="https://img.shields.io/badge/react-61DAFB?style=for-the-badge&logo=react&logoColor=black"> <img src="https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">

### Back
<img src="https://img.shields.io/badge/node.js-339933?style=for-the-badge&logo=Node.js&logoColor=white">

## 개발 포인트
### 1. 성능 최적화 고민
useCallback, useMemo 등으로 효율화할 수 있는 상황인지 고려
### 2. 편리한 UI, UX에 대한 고찰
- Enter 입력 시 버튼 동작
- 메시지 전송 시간 보여주기
- 채팅 참여자 목록을 모달창으로
- 본인은 따로 표기
- 개인 DM <-> 전체 메시지 전환 가능
- 개인 DM과 전체 메시지를 구분하여 스타일링
- 메시지 창에 여러줄 입력 시 자동으로 길이 조절

### 3. 예외처리
- 닉네임 중복 입력 시 안내 문구
- 입력값 없이 메시지 전송 불가

## 화면 구성
### 메인
<img width="550" alt="image" src="https://github.com/riverhye/chat/assets/77149171/8bbf6764-2a04-4f21-87f0-930cac4560b8">

- 닉네임 입력하여 채팅 입장


### 채팅
<img width="550" alt="image" src="https://github.com/riverhye/chat/assets/77149171/7257e72b-4148-41dc-b32d-949be7e85fc0">

<img width="550" alt="image" src="https://github.com/riverhye/chat/assets/77149171/0ddaf45b-d650-4ac5-b8cf-2b03212274a0">

- DM, 길게 메시지 보내기, 전체에게 보내기 등 채팅


## 시연
![채팅 화면](https://github.com/riverhye/chat/assets/77149171/f4c55cc3-4d30-4b8f-9796-29fb6e180e33)


## [회고록 ✍️](https://velog.io/@riverhye/chat-project)

