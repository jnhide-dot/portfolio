- 몬스터 스탯 (근거리 — `Assets/10.Data/Monsters/Normal_Monster.asset`, displayName "Slime", 프리팹: `normal_knight.prefab`)
<table header-row="true">
<tr>
<td>스탯</td>
<td>수치</td>
</tr>
<tr>
<td>HP</td>
<td>10000</td>
</tr>
<tr>
<td>ATK</td>
<td>70</td>
</tr>
<tr>
<td>DEF</td>
<td>0</td>
</tr>
<tr>
<td>ATK_SPD</td>
<td>1 (초당 1회)</td>
</tr>
<tr>
<td>MOV_SPD</td>
<td>2.5</td>
</tr>
<tr>
<td>Drop_Table</td>
<td>Gold 0 / Exp 0 (드랍 테이블 미구현 스텁)</td>
</tr>
<tr>
<td>Aggro_Range</td>
<td>6</td>
</tr>
<tr>
<td>Attack_Range</td>
<td>1.8</td>
</tr>
<tr>
<td>Max_Chase_Distance</td>
<td>12</td>
</tr>
<tr>
<td>Patrol</td>
<td>O (반경 3)</td>
</tr>
</table>
- 스테이지 난이도 스케일링: HP 배율 = 1 + 0.25×(스테이지-1), ATK 배율 = 1 + 0.15×(스테이지-1) (`StageBuilder.cs`, `MonsterStateMachine.cs`)
- FSM: Stop/Patrol → Chasing(0.5초마다 재타겟) → Attack(사거리 진입 시 공격, 사거리×1.5 벗어나면 재추격) → Return(스폰 기준 `Max_Chase_Distance` 초과 시 복귀)
- 관련 파일: `Assets/02.Scripts/03.Stage/Monster/MonsterData.cs`, `MonsterStateMachine.cs`, `MonsterAttackState.cs`, `MonsterChasingState.cs`
- 스프라이트 애니메이션 (`Assets/04.Images/normal_knight/`, `SpriteSheetAnimator.cs`로 재생)
- IDLE (8프레임)
![](files/project-g/project-g-monster-knight-1.gif)
- MOVE (8프레임)
![](files/project-g/project-g-monster-knight-2.gif)
- ATTACK / 전투(COMBAT) (8프레임)
![](files/project-g/project-g-monster-knight-3.gif)
- DIE / DEATH (8프레임)
![](files/project-g/project-g-monster-knight-4.gif)
- 스킬(SKILL) 전용 시트 없음
