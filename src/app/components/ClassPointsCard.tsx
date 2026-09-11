import React, {useState} from 'react';
import type {StudentRecord} from '../studentStore';

type ClassPointsCardProps = {
  className: string;
  students: StudentRecord[];
  onAddPoint: (studentId: string) => void;
  onClearPoints: () => void;
  onManageStudents: () => void;
};

const MAX_VISIBLE_STUDENTS = 4;

const Icon: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg
    viewBox="0 0 24 24"
    width={18}
    height={18}
    fill="none"
    stroke="currentColor"
    strokeWidth={2.4}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {children}
  </svg>
);

const ChevronIcon: React.FC<{expanded: boolean}> = ({expanded}) => (
  <span className={`class-points-chevron${expanded ? ' is-expanded' : ''}`}>
    <Icon>
      <path d="M6 9l6 6 6-6" />
    </Icon>
  </span>
);

const EditIcon: React.FC = () => (
  <Icon>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7.5 18.5 3 20l1.5-4.5Z" />
  </Icon>
);

const ResetIcon: React.FC = () => (
  <Icon>
    <path d="M3 12a9 9 0 1 0 3.2-6.9" />
    <path d="M3 4.5V10h5.5" />
  </Icon>
);

const getInitials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

export const ClassPointsCard: React.FC<ClassPointsCardProps> = ({
  className,
  students,
  onAddPoint,
  onClearPoints,
  onManageStudents,
}) => {
  const [showAll, setShowAll] = useState(false);
  const [awardedStudentId, setAwardedStudentId] = useState<string | null>(null);
  const visibleStudents = showAll ? students : students.slice(0, MAX_VISIBLE_STUDENTS);
  const remaining = Math.max(0, students.length - MAX_VISIBLE_STUDENTS);
  const totalPoints = students.reduce((sum, student) => sum + student.points, 0);

  const awardPoint = (studentId: string) => {
    onAddPoint(studentId);
    setAwardedStudentId(null);
    window.requestAnimationFrame(() => setAwardedStudentId(studentId));
  };

  return (
    <aside className="class-points-card">
      <div className="class-points-header">
        <div className="class-points-title">
          <img className="class-points-coin" src="assets/points-coin.png" alt="" />
          <div>
            <strong>Points</strong>
            <span>{className} team total: {totalPoints}</span>
          </div>
        </div>
        <button
          type="button"
          className="class-points-icon-button"
          onClick={() => setShowAll((current) => !current)}
          aria-label={showAll ? 'Show fewer students' : 'Show all students'}
          aria-expanded={showAll}
          title={showAll ? 'Show fewer students' : 'Show all students'}
        >
          <ChevronIcon expanded={showAll} />
        </button>
      </div>

      <div className="class-points-list">
        {visibleStudents.map((student) => (
          <div key={student.id} className="class-points-row">
            <div className="student-badge" aria-hidden="true">
              {getInitials(student.name)}
            </div>
            <div className="student-points-copy">
              <strong>{student.name}</strong>
              <span>
                <img className="inline-coin" src="assets/points-coin.png" alt="" />
                {student.points}
              </span>
            </div>
            <button type="button" className="point-add-button" onClick={() => awardPoint(student.id)} aria-label={`Add point for ${student.name}`}>
              +
              {awardedStudentId === student.id ? (
                <span className="coin-award-burst" aria-hidden="true">
                  <img className="award-coin award-coin-one" src="assets/points-coin.png" alt="" />
                  <img className="award-coin award-coin-two" src="assets/points-coin.png" alt="" />
                  <img className="award-coin award-coin-three" src="assets/points-coin.png" alt="" />
                </span>
              ) : null}
            </button>
          </div>
        ))}
      </div>

      {!showAll && remaining > 0 ? (
        <div className="class-points-more">+ {remaining} more students</div>
      ) : null}

      <div className="class-points-footer">
        <button
          type="button"
          className="class-points-icon-button"
          onClick={onManageStudents}
          aria-label="Edit students"
          title="Edit students"
        >
          <EditIcon />
        </button>
        <button
          type="button"
          className="class-points-icon-button class-points-icon-button-danger"
          onClick={onClearPoints}
          aria-label="Clear points"
          title="Clear points"
        >
          <ResetIcon />
        </button>
      </div>
    </aside>
  );
};
