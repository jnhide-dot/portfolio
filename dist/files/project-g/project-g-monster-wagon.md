- 황금마차는 `MonsterData`(공용 몬스터 스탯) 대신 전용 스크립트(`GoldenWagon.cs`)로 동작 — 이동/공격 능력이 없는 고정 타격 대상(파티가 Enemy 레이어로 인식해 자동 공격)입니다.
- 몬스터 스탯 (`Assets/02.Scripts/03.Stage/GoldenWagon.cs`, 프리팹: `GoldenWagon.prefab`)
<table header-row="true">
<tr>
<td>스탯</td>
<td>수치</td>
</tr>
<tr>
<td>HP</td>
<td>1000</td>
</tr>
<tr>
<td>ATK</td>
<td>없음(공격 안 함)</td>
</tr>
<tr>
<td>DEF</td>
<td>없음</td>
</tr>
<tr>
<td>ATK_SPD</td>
<td>없음</td>
</tr>
<tr>
<td>MOV_SPD</td>
<td>없음(고정)</td>
</tr>
<tr>
<td>Drop_Table</td>
<td>HP 10% 하락마다 골드 자동 지급 (아래 방 로직 참고)</td>
</tr>
<tr>
<td>Aggro_Range</td>
<td>없음</td>
</tr>
<tr>
<td>Destroyed_Linger_Time</td>
<td>1.5초 (파괴 후 비활성화까지 대기)</td>
</tr>
</table>
- 행동/연출: HP 비율(100/70/30/0%)에 따라 스프라이트 교체, 파괴 시 1.5초 후 비활성화
- 방(`GoldenWagonRoom.cs`): 30초 타이머, HP 10%(=100골드 단위, maxGold 1000) 하락마다 자동 골드 지급 + 코인 연출 + 효과음, 파괴 또는 타이머 종료 시 방 클리어
- 관련 파일: `Assets/02.Scripts/03.Stage/GoldenWagon.cs`, `GoldenWagonRoom.cs`
- 스프라이트 (`Assets/04.Images/GoldenWagon/`, 전용 `GoldenWagon.cs`로 체력 비율에 따라 스위칭 — 애니메이션 프레임이 아니라 내구도별 정지 이미지 4장)
- 100% (온전한 상태)
![](files/project-g/project-g-monster-wagon-1.png)
- 70%
![](files/project-g/project-g-monster-wagon-2.png)
- 30%
![](files/project-g/project-g-monster-wagon-3.png)
- 0% (파괴됨)
![](files/project-g/project-g-monster-wagon-4.png)
