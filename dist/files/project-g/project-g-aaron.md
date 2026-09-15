![](files/project-g/project-g-aaron-1.png)
- 캐릭터 컨셉
<table>
<colgroup>
<col width="235.33333333333334">
<col width="235.33333333333334">
</colgroup>
<tr>
<td>컬러</td>
<td>White, Blue green</td>
</tr>
<tr>
<td>성별</td>
<td>남성</td>
</tr>
<tr>
<td>무기</td>
<td>활</td>
</tr>
<tr>
<td>사거리</td>
<td>원거리</td>
</tr>
</table>
- 스탯
<table>
<colgroup>
<col width="240">
<col width="445.99998474121094">
</colgroup>
<tr>
<td>스탯(Max_Level)</td>
<td>수치</td>
</tr>
<tr>
<td>HP</td>
<td>6000</td>
</tr>
<tr>
<td>ATK</td>
<td>1200</td>
</tr>
<tr>
<td>DEF</td>
<td>500</td>
</tr>
<tr>
<td>CRITICAL CHANCE</td>
<td>5%</td>
</tr>
<tr>
<td>CRITICAL DAMAGE</td>
<td>50%</td>
</tr>
</table>
- 스킬
	- 일반공격
		- 검을 휘둘러 부채꼴 범위에 데미지를 준다
		<table>
		<colgroup>
		<col width="107.328125">
		<col width="101.328125">
		<col width="92.328125">
		<col>
		<col>
		</colgroup>
<tr>
<td>기반 스탯</td>
<td>계수 </td>
<td>타겟팅</td>
<td>사거리</td>
<td>시전시간(초)</td>
</tr>
<tr>
<td>ATK</td>
<td>80%</td>
<td>범위(부채꼴)</td>
<td>2</td>
<td>0.5</td>
</tr>
		</table>
	- 스킬
		- 검을 휘둘러 비교적 넓은 부채꼴 범위에 데미지를 준다
		<table>
		<colgroup>
		<col width="94">
		<col width="69">
		<col width="95">
		<col width="77">
		<col width="97">
		<col>
		</colgroup>
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
<td>150%</td>
<td>범위(부채꼴)</td>
<td>4</td>
<td>0.5</td>
<td>8</td>
</tr>
		</table>
<empty-block/>
- 실제 구현 수치 (코드 기준 — Assets/[10.Data/Heroes/Archer.asset](http://10.Data/Heroes/Archer.asset), HeroData.cs)
⚠️ 위 기획 초안 스킬 표는 전사(앨리스) 항목이 잘못 복사된 것으로 보입니다(부채꼴 근접 스킬 텍스트). 실제 아처는 다중 화살(멀티샷) 원거리 스킬이며, 아래가 실제 코드/에셋 값입니다.
- 스탯(코드 기준)
<table header-row="true">
<tr>
<td>스탯</td>
<td>값</td>
</tr>
<tr>
<td>HP</td>
<td>6000</td>
</tr>
<tr>
<td>ATK</td>
<td>1200</td>
</tr>
<tr>
<td>DEF</td>
<td>350</td>
</tr>
<tr>
<td>CRITICAL CHANCE</td>
<td>0% (미사용)</td>
</tr>
<tr>
<td>CRITICAL DAMAGE</td>
<td>0% (미사용)</td>
</tr>
<tr>
<td>공격속도</td>
<td>1회/초</td>
</tr>
<tr>
<td>이동속도</td>
<td>5</td>
</tr>
</table>
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
<td>단일(화살 발사체)</td>
<td>6</td>
<td>-</td>
</tr>
</table>
- 스킬(멀티샷)
<table header-row="true">
<tr>
<td>기반 스탯</td>
<td>계수(발당)</td>
<td>타겟팅</td>
<td>사거리</td>
<td>쿨타임(초)</td>
</tr>
<tr>
<td>ATK</td>
<td>150% × 3발</td>
<td>최근접 적 3명(부족 시 최근접 집중)</td>
<td>6</td>
<td>6</td>
</tr>
</table>
- 관련 파일: Assets/02.Scripts/03.Stage/Player/HeroData.cs, PlayerStateMachine.cs, CombatState.cs, Assets/03.Prefabs/Archer.prefab
- 스프라이트 애니메이션 (`Assets/04.Images/Archer/`, `SpriteSheetAnimator.cs`로 재생)
- IDLE (8프레임)
![](files/project-g/project-g-aaron-2.gif)
- MOVE (8프레임)
![](files/project-g/project-g-aaron-3.gif)
- ATTACK / 전투(COMBAT) (8프레임)
![](files/project-g/project-g-aaron-4.gif)
- DIE / DEATH (8프레임)
![](files/project-g/project-g-aaron-5.gif)
- 투사체(Projectile) 스프라이트 — `arrow.png` (`Assets/04.Images/Archer/`, Single 스프라이트)
	![](files/project-g/project-g-aaron-6.png)
- 별도 스킬(멀티샷) 전용 시트는 없음 — 일반공격/스킬 모두 COMBAT 프레임 재생 + `arrow.png`(투사체 단일 스프라이트) 조합으로 연출
- 관련 파일: `Assets/02.Scripts/03.Stage/Player/SpriteSheetAnimator.cs`, `Assets/03.Prefabs/Archer.prefab`
