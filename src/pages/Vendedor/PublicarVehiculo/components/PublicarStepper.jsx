import { Check } from "lucide-react";
import styles from "./PublicarStepper.module.css";

const PublicarStepper = ({ steps, currentStep, onStepClick }) => {
  return (
    <div className={styles.stepsNav}>
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = step.id < currentStep;

        return (
          <div key={step.id} className={styles.stepItemWrapper}>
            <button
              type="button"
              className={`${styles.stepItem} ${
                isActive ? styles.stepActive : ""
              } ${isCompleted ? styles.stepCompleted : ""}`}
              onClick={() => onStepClick(step.id)}
            >
              <div className={styles.stepCircle}>
                {isCompleted ? <Check size={16} /> : step.id}
              </div>

              <span>{step.label}</span>
            </button>

            {index < steps.length - 1 && <div className={styles.stepLine}></div>}
          </div>
        );
      })}
    </div>
  );
};

export default PublicarStepper;
