<columns>
	<column ratio="50">
		![](files/project-g/project-g-alice-1.webp)
		<empty-block/>
	</column>
	<column ratio="50">
		![](files/project-g/project-g-alice-2.webp)
	</column>
</columns>
<empty-block/>
- 캐릭터 컨셉
<table>
<colgroup>
<col width="235.33333333333334">
<col width="235.33333333333334">
</colgroup>
<tr>
<td>컬러</td>
<td>Gray, Black</td>
</tr>
<tr>
<td>성별</td>
<td>여성</td>
</tr>
<tr>
<td>무기</td>
<td>검/마검</td>
</tr>
<tr>
<td>사거리</td>
<td>근거리</td>
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
<td>6500</td>
</tr>
<tr>
<td>ATK</td>
<td>1000</td>
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
- 스프라이트 애니메이션
	- IDLE
		![](files/project-g/project-g-alice-3.gif)
	- MOVE
		![](files/project-g/project-g-alice-4.gif)
	- ATTACK
		![](files/project-g/project-g-alice-5.gif)
	- DIE
		![](files/project-g/project-g-alice-death.gif)
		<empty-block/>
- 실제 구현 수치 (코드 기준 — Assets/[10.Data/Heroes/Warrior.asset](http://10.Data/Heroes/Warrior.asset), HeroData.cs)
⚠️ 위 기획 초안 수치와 다름. 아래는 실제 코드/에셋에 반영된 값입니다.
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
<td>1000</td>
</tr>
<tr>
<td>DEF</td>
<td>550</td>
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
<td>단일</td>
<td>2</td>
<td>-</td>
</tr>
</table>
- 스킬(부채꼴 베기)
<table header-row="true">
<tr>
<td>기반 스탯</td>
<td>계수</td>
<td>타겟팅</td>
<td>사거리</td>
<td>각도</td>
<td>쿨타임(초)</td>
</tr>
<tr>
<td>ATK</td>
<td>300%</td>
<td>범위(부채꼴, 반경 3.5)</td>
<td>2</td>
<td>120°</td>
<td>5</td>
</tr>
</table>
- 관련 파일: Assets/02.Scripts/03.Stage/Player/HeroData.cs, PlayerStateMachine.cs, CombatState.cs, Assets/03.Prefabs/Warrior.prefab
