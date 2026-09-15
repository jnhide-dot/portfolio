<empty-block/>
![](files/project-g/project-g-luna-1.png)
<empty-block/>
- 캐릭터 컨셉
<table>
<tr>
<td>컬러</td>
<td>White, Pink</td>
</tr>
<tr>
<td>성별</td>
<td>여</td>
</tr>
<tr>
<td>무기</td>
<td>기도문</td>
</tr>
<tr>
<td>사거리</td>
<td>원거리</td>
</tr>
</table>
- 기본 정보
	- 내부/표시 이름: `Healer`
	- 역할: 아군 힐러(서포터) — 스킬이 "체력이 가장 낮은 아군 회복"으로 동작
	- 희귀도: Rare
	- 정의: `ProjectG.HeroData` (ScriptableObject)
- 스탯 (Healer.asset)
<table header-row="true">
<colgroup>
<col>
<col width="561.8125">
</colgroup>
<tr>
<td>스탯</td>
<td>값</td>
</tr>
<tr>
<td>최대 체력</td>
<td>4500</td>
</tr>
<tr>
<td>공격력</td>
<td>600</td>
</tr>
<tr>
<td>방어력</td>
<td>400</td>
</tr>
<tr>
<td>크리티컬 확률/배율</td>
<td>0 / 0</td>
</tr>
<tr>
<td>초당 공격 횟수</td>
<td>1</td>
</tr>
<tr>
<td>이동속도</td>
<td>5</td>
</tr>
<tr>
<td>공격 사거리</td>
<td>3</td>
</tr>
<tr>
<td>스킬 쿨타임</td>
<td>5</td>
</tr>
<tr>
<td>스킬 계수</td>
<td>2.5</td>
</tr>
<tr>
<td>일반공격 계수</td>
<td>1</td>
</tr>
</table>
다른 영웅(Archer/Warrior) 대비 체력·방어력이 가장 높은 탱키한 서포터 성향입니다.
- 스킬(코드 기준)
- 일반공격
<table header-row="true">
<tr>
<td>기반 스탯</td>
<td>계수</td>
<td>타겟팅</td>
<td>사거리</td>
<td>쿨타임(초)</td>
</tr>
<tr>
<td>ATK</td>
<td>100%</td>
<td>단일</td>
<td>3</td>
<td>-</td>
</tr>
</table>
- 회복 스킬(별도 이름 미지정)
<table header-row="true">
<tr>
<td>기반 스탯</td>
<td>계수</td>
<td>타겟팅</td>
<td>사거리</td>
<td>시전시간(초)</td>
<td>쿨타임(초)</td>
</tr>
<tr>
<td>ATK</td>
<td>250%</td>
<td>아군 중 체력비율 최저 1명 자동 타겟</td>
<td>3(근접)</td>
<td>0.8</td>
<td>5</td>
</tr>
</table>
- 스프라이트 애니메이션 (`Assets/04.Images/Healer/`, `SpriteSheetAnimator.cs`로 재생 — Animator Controller 미사용, 프레임 배열 직접 교체 방식)
- IDLE (8프레임)
![](files/project-g/project-g-luna-2.gif)
- MOVE (8프레임)
![](files/project-g/project-g-luna-3.gif)
- ATTACK / 전투(COMBAT) (10프레임 중 8프레임 사용, releaseFrame 4)
![](files/project-g/project-g-luna-4.gif)
- SKILL (8프레임)
![](files/project-g/project-g-luna-5.gif)
- DIE / DEATH (8프레임)
![](files/project-g/project-g-luna-6.gif)
- Color 텍스처 (`T_VFX_Heal_01_Color.tga`)
	![](files/project-g/project-g-luna-7.gif)
- Mask 텍스처 (`T_VFX_Heal_01_Mask.tga`)
	![](files/project-g/project-g-luna-8.gif)
- 관련 파일: `Assets/02.Scripts/03.Stage/Player/SpriteSheetAnimator.cs`, `Assets/03.Prefabs/Healer.prefab`(자식 오브젝트 `Sprite`에 `SpriteRenderer` + `SpriteSheetAnimator` 부착), framesPerSecond 10
- 힐 스킬 VFX — `VFX_Heal_01_Color_Static.prefab` (`Assets/Vefects/Pixel Craft VFX/VFX/Heal/Particles/`, Healer.prefab에서 스킬 시전 시 회복 대상 위치에 생성, 지속시간 1.2초)
	- 텍스처 원본은 .tga라 8프레임 스프라이트시트(256×32)를 PNG로 변환해서 첨부함
- 관련 파일: `Assets/Vefects/Pixel Craft VFX/VFX/Heal/Particles/VFX_Heal_01_Color_Static.prefab`, `VFX_Heal_01_Mask_Static.prefab`, `Materials/M_VFX_Heal_01_Color.mat`
<empty-block/>
