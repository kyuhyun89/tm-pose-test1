# GitHub Pages 배포 가이드 🚀

이 프로젝트를 인터넷에 배포하여 누구나 접속할 수 있게 만드는 방법입니다.

## 1. 코드 업로드 (Git Push)
먼저 로컬에 저장된 최신 코드를 GitHub 원격 저장소로 올려야 합니다.
VS Code 터미널에서 아래 명령어를 입력하세요:

```bash
git push origin main
```

> **참고**: 만약 로그인 창이 뜨면 GitHub 계정으로 로그인해주세요.

## 2. GitHub 저장소 설정
코드가 올라갔다면, GitHub 웹사이트에서 설정을 변경해야 합니다.

1.  웹브라우저에서 저장소로 이동: [https://github.com/kyuhyun89/tm-pose-test1](https://github.com/kyuhyun89/tm-pose-test1)
2.  상단 메뉴의 **Settings** (설정) 탭 클릭.
3.  왼쪽 사이드바에서 **Pages** 메뉴 클릭.

## 3. GitHub Pages 활성화
**Build and deployment** 섹션에서 다음을 설정하세요:

*   **Source**: `Deploy from a branch` 선택
*   **Branch**: `main` 선택 / 폴더는 `/(root)` 선택
*   **Save** 버튼 클릭

## 4. 접속 확인
설정 후 약 1~3분 정도 기다리면 페이지 상단에 배포된 주소가 나타납니다.
예: `https://kyuhyun89.github.io/tm-pose-test1/`

이 주소를 클릭하면 배포된 게임을 확인할 수 있습니다! 🎮
