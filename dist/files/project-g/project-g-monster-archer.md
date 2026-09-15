- 몬스터 스탯 (원거리/궁수 — `Assets/10.Data/Monsters/Normal_Archer.asset`, displayName "Archer", 프리팹: `normal_archer.prefab`)
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
<td>9</td>
</tr>
<tr>
<td>Attack_Range</td>
<td>6</td>
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
- `projectilePrefab` 지정됨 → 공격 시 실제 화살 투사체 발사 연출 포함 (일반 몬스터 중 유일)
- 스테이지 난이도 스케일링: HP 배율 = 1 + 0.25×(스테이지-1), ATK 배율 = 1 + 0.15×(스테이지-1)
- 관련 파일: `Assets/02.Scripts/03.Stage/Monster/MonsterData.cs`, `MonsterStateMachine.cs`, `MonsterAttackState.cs`
- 스프라이트 애니메이션 (`Assets/04.Images/normal_archer/`, `SpriteSheetAnimator.cs`로 재생)
- IDLE (8프레임)
![](files/project-g/project-g-monster-archer-1.gif)
- MOVE (8프레임)
![](files/project-g/project-g-monster-archer-2.gif)
- ATTACK / 전투(COMBAT) (8프레임)
![](files/project-g/project-g-monster-archer-3.gif)
- DIE / DEATH (8프레임)
![](files/project-g/project-g-monster-archer-4.gif)
- 스킬(SKILL) 전용 시트 없음, 투사체는 `arrow.png`(단일 스프라이트) 사용
