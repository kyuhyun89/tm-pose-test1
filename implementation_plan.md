# Implementation Plan - Fruit Catcher Game

[Fruit Catcher]는 하늘에서 떨어지는 과일을 **고개 기울이기(Head Tilt)** 로 바구니를 움직여 받는 게임입니다.

## Proposed Changes

### Logic Layer
#### [MODIFY] [gameEngine.js](file:///c:/Users/User/Documents/1일차/tm-pose-test1/js/gameEngine.js)
*   3-Lane 시스템 (`Left`, `Center`, `Right`) 상태 관리
    *   `Left`: 고개 왼쪽 (바구니 왼쪽 이동)
    *   `Right`: 고개 오른쪽 (바구니 오른쪽 이동)
*   `items` 배열 추가 및 아이템 생성/낙하 로직 구현
    *   아이템: Apple(10), Orange(20), Banana(30), Bomb(-50)
*   충돌 감지 (Collision Detection) 구현
*   타이머(30초) 및 게임 오버 로직 수정
*   `update()` (프레임별 로직) 및 `draw(ctx)` (렌더링) 메서드 추가

#### [MODIFY] [main.js](file:///c:/Users/User/Documents/1일차/tm-pose-test1/js/main.js)
*   `drawPose` 콜백 내에서 `gameEngine.update()` 및 `gameEngine.draw(ctx)`를 매 프레임 호출하도록 연결
*   캔버스 크기(200x200)에 맞춰 게임 요소 크기 조정

### UI/Config Layer
#### [MODIFY] [GAME_RULE.md](file:///c:/Users/User/Documents/1일차/tm-pose-test1/GAME_RULE.md)
*   조작 방식(고개 기울이기) 및 점수/규칙 정의 완료

## Verification Plan

### Manual Verification
1.  **조작 테스트**:
    *   고개를 왼쪽으로 까딱하면 바구니가 왼쪽으로 이동하는지 확인.
    *   고개를 오른쪽으로 까딱하면 바구니가 오른쪽으로 이동하는지 확인.
2.  **게임 플레이**:
    *   과일/폭탄이 정상적으로 떨어지는지 확인.
    *   바구니로 과일을 잡았을 때 점수(+10/+20/+30) 증가 확인.
    *   폭탄을 잡았을 때 점수(-50) 차감 확인.
3.  **종료 테스트**:
    *   30초 경과 후 게임이 멈추고 최종 점수가 표시되는지 확인.
