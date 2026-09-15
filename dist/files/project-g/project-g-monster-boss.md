- 몬스터 스탯 (`Assets/10.Data/Monsters/Boss_Grandmaster.asset`, displayName "Grandmaster")
<table header-row="true">
<tr>
<td>스탯</td>
<td>수치</td>
</tr>
<tr>
<td>HP</td>
<td>20000</td>
</tr>
<tr>
<td>ATK</td>
<td>300</td>
</tr>
<tr>
<td>DEF</td>
<td>0</td>
</tr>
<tr>
<td>ATK_SPD</td>
<td>1</td>
</tr>
<tr>
<td>MOV_SPD</td>
<td>2.5</td>
</tr>
<tr>
<td>Drop_Table</td>
<td>Gold 0 / Exp 0 (미구현 스텁)</td>
</tr>
<tr>
<td>Aggro_Range</td>
<td>12</td>
</tr>
<tr>
<td>Attack_Range</td>
<td>3.5</td>
</tr>
<tr>
<td>Max_Chase_Distance</td>
<td>20</td>
</tr>
<tr>
<td>Patrol</td>
<td>X</td>
</tr>
</table>
⚠️ 이 asset은 실제로 어떤 프리팹/씬에서도 참조되지 않음(미사용). 보스는 `MonsterData`를 쓰지 않고 `BossStateMachine`(`boss_grandmaster.prefab`)이 자체 `PatternSettings` 필드로 스탯을 관리합니다 — 아래 패턴 표가 실제 전투에 적용되는 값입니다.
- 패턴 (`BossStateMachine.cs`, 설계 원칙: No Stun / No Knockback / Root Only)
<table header-row="true">
<tr>
<td>패턴</td>
<td>데미지</td>
<td>범위/각도</td>
<td>선딜→타격</td>
<td>지속시간</td>
<td>쿨다운</td>
<td>우선순위</td>
<td>부가효과</td>
</tr>
<tr>
<td>패턴 1 · 검 베기 (Slash)</td>
<td>200</td>
<td>사거리 3, 부채꼴 ±60°(120°)</td>
<td>0.3초</td>
<td>0.8초</td>
<td>2초</td>
<td>1</td>
<td>전진 슬라이드 1.5</td>
</tr>
<tr>
<td>패턴 2 · 방패 밀치기 (Bash)</td>
<td>700</td>
<td>사거리 2.5, 반원 ±90°(180°)</td>
<td>0.4초</td>
<td>0.8초</td>
<td>4초</td>
<td>2</td>
<td>슬로우 1.5초(이동속도 40%로 감소), Stun/Knockback 없음</td>
</tr>
<tr>
<td>패턴 3 · 돌진 (Charge Rush, 선택)</td>
<td>4000</td>
<td>길이 8 × 폭 1.5 직선 히트박스</td>
<td>차징(방향고정) 1.8초 → 락타임 0.5초</td>
<td>돌진속도 15로 이동, 벽 충돌 시 즉시 취소</td>
<td>13초</td>
<td>3</td>
<td>파티원 콜라이더 무시</td>
</tr>
</table>
기타: idleMoveSpeed 2, stopDistance 1.5, rotationSpeed 8, gravity 9.81
- 관련 파일: `Assets/02.Scripts/03.Stage/Monster/Boss/BossStateMachine.cs`, `BossSlashState.cs`, `BossBashState.cs`, `BossChargingState.cs`(1단계: 방향고정), `BossChargeRushingState.cs`(2단계: 돌진 실행), `BossIdleState.cs`, `BossDeathState.cs`
- 스프라이트 애니메이션 (`Assets/04.Images/boss_grandmaster/`, `SpriteSheetAnimator.cs`로 재생)
- IDLE (8프레임)
![](files/project-g/project-g-monster-boss-1.gif)
- MOVE (8프레임)
![](files/project-g/project-g-monster-boss-2.gif)
- ATTACK / 전투(COMBAT, 실제로는 `blit_203ef3b1_motion_master.png` 사용 — `boss_grandmaster_combat.png`는 존재하지만 프리팹에서 미참조 상태)
![](files/project-g/project-g-monster-boss-3.gif)
- 패턴 1(검 베기, SKILL) (8프레임)
![](files/project-g/project-g-monster-boss-4.gif)
- 패턴 3(돌진, CHARGE RUSH) (8프레임)
![](files/project-g/project-g-monster-boss-5.gif)
- 패턴 2(방패 밀치기, BASH) (8프레임)
![](files/project-g/project-g-monster-boss-6.gif)
- DIE / DEATH (8프레임)
![](files/project-g/project-g-monster-boss-7.gif)
- ⚠️ 참고: `boss_grandmaster_combat.png` 파일 자체는 존재하지만 실제 프리팹에서는 참조되지 않고 있음(미사용 애셋)
