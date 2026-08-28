import React, {useEffect, useState} from 'react';

type StudentSetupModalProps = {
  className: string;
  initialNames: string[];
  onCancel: () => void;
  onContinue: (names: string[]) => void;
};

const emptyRows = ['', '', '', ''];

const normalizeNames = (names: string[]): string[] =>
  names.map((name) => name.trim()).filter((name) => name.length > 0);

export const StudentSetupModal: React.FC<StudentSetupModalProps> = ({
  className,
  initialNames,
  onCancel,
  onContinue,
}) => {
  const [names, setNames] = useState<string[]>(initialNames.length > 0 ? initialNames : emptyRows);
  const [step, setStep] = useState(1);

  useEffect(() => {
    setNames(initialNames.length > 0 ? initialNames : emptyRows);
    setStep(1);
  }, [initialNames]);

  const updateName = (index: number, value: string) => {
    setNames((current) => current.map((name, itemIndex) => (itemIndex === index ? value : name)));
  };

  const addRow = () => setNames((current) => [...current, '']);

  const cleanNames = normalizeNames(names);

  const continueSetup = () => {
    if (step === 1) {
      if (cleanNames.length > 0) setStep(2);
      return;
    }
    onContinue(cleanNames);
  };

  return (
    <div className="dialog-scrim" role="presentation">
      <section className="class-dialog student-setup-dialog" role="dialog" aria-modal="true" aria-labelledby="student-setup-title">
        <header className="student-setup-progress">
          <strong>Step {step} of 2</strong>
          <div className="student-progress-track" aria-label={`Step ${step} of 2`}>
            <span className="student-progress-dot active">1</span>
            <span className={`student-progress-line ${step === 2 ? 'complete' : ''}`} />
            <span className={`student-progress-dot ${step === 2 ? 'active' : ''}`}>2</span>
          </div>
        </header>

        {step === 1 ? (
          <div className="student-setup-body">
            <div className="student-setup-form">
              <span className="page-kicker">Class setup</span>
              <h2 id="student-setup-title">Create your class list</h2>
              <p>You can add names now and edit them later.</p>
              <div className="student-setup-list">
                <strong className="student-list-label">Student names</strong>
                {names.map((name, index) => (
                  <label key={index} className="student-name-field">
                    <span className="student-row-number">{index + 1}</span>
                    <input
                      value={name}
                      onChange={(event) => updateName(index, event.target.value)}
                      placeholder="Enter student name"
                      aria-label={`Student ${index + 1} name`}
                    />
                  </label>
                ))}
              </div>
              <button type="button" className="student-add-button" onClick={addRow}>
                <span aria-hidden="true">+</span> Add student
              </button>
            </div>

            <aside className="student-setup-aside" aria-label="What happens next">
              <h3>What happens next?</h3>
              <div className="setup-benefit"><img className="setup-benefit-icon" src="assets/class-setup-people.png" alt="" /><strong>Names appear in the points panel</strong></div>
              <div className="setup-benefit"><img className="setup-benefit-icon" src="assets/class-setup-coin.png" alt="" /><strong>Tap + to award coins</strong></div>
              <div className="setup-benefit"><img className="setup-benefit-icon" src="assets/class-setup-saved.png" alt="" /><strong>Saved on this device</strong></div>
              <img src="assets/class-setup-backpack.png" alt="School backpack and books" />
            </aside>
          </div>
        ) : (
          <div className="student-confirmation">
            <span className="page-kicker">Ready to go</span>
            <h2 id="student-setup-title">Your class list is ready</h2>
            <p>{cleanNames.length} student{cleanNames.length === 1 ? '' : 's'} will appear in the points panel for {className}.</p>
            <div className="student-confirmation-names">
              {cleanNames.map((name) => <span key={name}>{name}</span>)}
            </div>
          </div>
        )}

        <footer className="student-setup-actions">
          <button type="button" className="student-back-button" onClick={step === 1 ? onCancel : () => setStep(1)}>
            Back
          </button>
          <button type="button" className="student-next-button" onClick={continueSetup} disabled={step === 1 && cleanNames.length === 0}>
            {step === 1 ? 'Next' : 'Open class'} <span aria-hidden="true">→</span>
          </button>
        </footer>
      </section>
    </div>
  );
};
