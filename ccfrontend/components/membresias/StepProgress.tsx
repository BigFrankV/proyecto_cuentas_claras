interface StepProgressProps {
  steps: {
    id: number;
    name: string;
    completed?: boolean;
    active?: boolean;
    disabled?: boolean;
  }[];
  currentStep: number;
}

export default function StepProgress({
  steps,
  currentStep,
}: StepProgressProps) {
  return (
    <div className='step-progress'>
      <div className='progress' style={{ height: '4px' }}>
        <div
          className='progress-bar bg-success'
          role='progressbar'
          style={{ width: `${(currentStep / steps.length) * 100}%` }}
          aria-valuenow={currentStep}
          aria-valuemin={0}
          aria-valuemax={steps.length}
        />
      </div>
      <div className='d-flex justify-content-between mt-2'>
        {steps.map(step => (
          <div key={step.id} className='text-center'>
            <div
              className={`badge rounded-circle ${
                step.completed
                  ? 'bg-success'
                  : step.active
                    ? 'bg-primary'
                    : 'bg-secondary'
              }`}
              style={{ width: '24px', height: '24px', fontSize: '12px' }}
            >
              {step.completed ? (
                <i className='material-icons' style={{ fontSize: '12px' }}>
                  check
                </i>
              ) : (
                step.id
              )}
            </div>
            <div className='small mt-1'>{step.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
