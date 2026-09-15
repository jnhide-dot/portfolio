- ⚠️ 미구현 주의: `normal_wizard.prefab`은 전용 스탯/투사체 없이 근접형 `Normal_Monster.asset`("Slime" 데이터)를 그대로 재사용 중입니다. 즉 비주얼만 마법사이고 실제 전투 수치·사거리·투사체는 아래 근거리 기본형과 동일합니다. 마법 투사체/전용 스탯 추가는 향후 작업 필요.
- 몬스터 스탯 (현재 적용 중 — `Assets/10.Data/Monsters/Normal_Monster.asset` 재사용, 프리팹: `normal_wizard.prefab`)
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
<td>1.8 (근접, 마법사인데 원거리 투사체 없음)</td>
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
- 관련 파일: `Assets/02.Scripts/03.Stage/Monster/MonsterData.cs`, `MonsterStateMachine.cs` / 프리팹: `Assets/03.Prefabs/normal_wizard.prefab`
- 스프라이트 애니메이션 (`Assets/04.Images/normal_wizard/`, `SpriteSheetAnimator.cs`로 재생)
- IDLE (8프레임)
![](files/project-g/project-g-monster-wizard-1.gif)
- MOVE (8프레임, 파일명 `znormal_wizard_move.png`로 접두어 오타 있음)
![](files/project-g/project-g-monster-wizard-2.gif)
- ATTACK / 전투(COMBAT) (8프레임)
![](files/project-g/project-g-monster-wizard-3.gif)
- DIE / DEATH (8프레임)
![](files/project-g/project-g-monster-wizard-4.gif)
- 스킬(SKILL) 전용 시트 없음 — 위에서 언급했듯 마법 투사체/전용 스킬 로직 자체가 미구현 상태
