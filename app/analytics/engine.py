
def classify_concept_state(accuracy: float, avg_solve_time: float, retry_count: int) -> str:
    """
    학습 신호를 기반으로 개념 숙련도 상태를 판정합니다.
    """
    
    # 임계값 (Thresholds) - 실제 데이터에 따라 튜닝 필요
    ACCURACY_LOW = 60.0
    ACCURACY_HIGH = 90.0
    TIME_LONG = 60.0 # 초 단위 (예: 문제당 60초 이상)
    TIME_SHORT = 10.0 # 초 단위 (예: 문제당 10초 미만)

    # 1. Struggling: 개념 이해 부족
    # 정답률 낮음 + 시간 오래 걸림 (몰라서 헤맴)
    if accuracy < ACCURACY_LOW and avg_solve_time >= TIME_LONG:
        return "struggling"

    # 2. Careless: 실수형
    # 정답률 낮음 + 시간 짧음 (대충 풂)
    if accuracy < ACCURACY_LOW and avg_solve_time <= TIME_SHORT:
        return "careless"

    # 3. Unstable: 불안정 이해
    # 정답률은 높으나 재시도 횟수가 많거나 시간이 들쭉날쭉 (아직 확실치 않음)
    # 여기서는 간단히 retry_count로 판단
    if accuracy >= ACCURACY_LOW and retry_count > 2:
        return "unstable"

    # 4. Mastered: 숙달
    # 정답률 높음 + 시간 적절함
    if accuracy >= ACCURACY_HIGH:
        return "mastered"

    # 그 외: 진행 중
    return "learning"
