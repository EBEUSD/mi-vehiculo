import { Check } from "lucide-react";
import styles from "./PublicarStepper.module.css";

const PublicarStepper = ({ steps, currentStep, onStepClick }) => {
  const pct = Math.round(((currentStep - 1) / (steps.length - 1)) * 100);
  const currentStepData = steps.find((s) => s.id === currentStep);

  return (
    <div className={styles.bar}>
      <div className={styles.inner}>
        {/* Paso X / N + step name */}
        <div className={styles.progressLabel}>
          <span className={styles.progressCurrent}>Paso {currentStep}</span>
          <span className={styles.progressTotal}> / {steps.length}</span>
          {currentStepData && (
            <span className={styles.progressName}>{currentStepData.label}</span>
          )}
        </div>

        {/* Steps row — circles only, no truncated labels */}
        <div className={styles.stepsRow} style={{ "--pct": `${pct}%` }}>
          <div className={styles.trackBg} />
          <div className={styles.trackFill} />

          {steps.map((step) => {
            const isActive    = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            const isReachable = step.id <= currentStep;

            return (
              <div
                key={step.id}
                className={styles.stepWrap}
                style={{ left: `${((step.id - 1) / (steps.length - 1)) * 100}%` }}
              >
                <button
                  type="button"
                  className={[
                    styles.step,
                    isActive    ? styles.stepActive : "",
                    isCompleted ? styles.stepDone   : "",
                  ].join(" ")}
                  onClick={() => isReachable && onStepClick(step.id)}
                  disabled={!isReachable}
                  title={step.label}
                >
                  <span className={styles.circle}>
                    {isCompleted ? <Check size={12} strokeWidth={3} /> : step.id}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PublicarStepper;
