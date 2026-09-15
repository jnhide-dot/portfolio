- 상인은 `MonsterData`(공용 몬스터 스탯) 대신 전용 스크립트(`MerchantAI.cs`, `MerchantAnimator.cs`)로 동작 — 공격력/방어력 없이 도망 다니다 처치되는 특수 타입입니다.
- 몬스터 스탯 (`Assets/02.Scripts/03.Stage/MerchantAI.cs`, 프리팹: `Merchant.prefab`)
<table header-row="true">
<tr>
<td>스탯</td>
<td>수치</td>
</tr>
<tr>
<td>HP</td>
<td>4000</td>
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
<td>0.7 (평상시 배회), 도망 시 6</td>
</tr>
<tr>
<td>Drop_Table</td>
<td>처치 시 골드 지급 (아래 방 로직 참고)</td>
</tr>
<tr>
<td>Aggro_Range</td>
<td>없음(플레이어를 인식하지 않고, 피격 시에만 반응)</td>
</tr>
<tr>
<td>Flee_Duration</td>
<td>5초</td>
</tr>
<tr>
<td>Exhausted_Duration</td>
<td>3초 (탈진 상태, 이 구간에만 공격 가능)</td>
</tr>
<tr>
<td>Wander_Radius</td>
<td>7</td>
</tr>
</table>
- 행동 패턴: `Wander`(배회) → 피격 시 `Flee`(리더 반대 방향 + 벽 반사로 도망) → 도망시간 종료 시 `Exhausted`(제자리 고정, 이때만 처치 가능) → 다시 `Flee` 반복
- 방(`GoldenMerchantRoom.cs`): 방 진입 시 상인들 활성화 + 60초 타이머 시작, 상인 처치 시 `maxGold / totalMerchants`만큼 골드 지급 + 코인 연출, 전원 처치 또는 타이머 만료 시 방 클리어
- 관련 파일: `Assets/02.Scripts/03.Stage/MerchantAI.cs`, `MerchantAnimator.cs`, `GoldenMerchantRoom.cs`
- 스프라이트 애니메이션 (`Assets/04.Images/merchant/`, 전용 `MerchantAnimator.cs`로 재생 — SpriteSheetAnimator 미사용)
- IDLE (8프레임)
![](files/project-g/project-g-monster-merchant-1.gif)
- RUN / 도망(FLEE) (8프레임)
![](files/project-g/project-g-monster-merchant-2.gif)
- EXHAUSTED / 탈진 (8프레임, 이 상태에서만 처치 가능)
![](files/project-g/project-g-monster-merchant-3.gif)
- DIE (8프레임)
![](files/project-g/project-g-monster-merchant-4.gif)
