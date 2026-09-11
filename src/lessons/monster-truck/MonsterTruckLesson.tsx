import {GenericLesson} from '../generic/GenericLesson';
import {MonsterTruckStage, MonsterTruckPartPreview} from './MonsterTruckStage';
import content from './content.json';
import '../generic/lesson.scoped.css';

export const MonsterTruckLesson: React.FC<{
  onHome?: () => void;
  onComplete?: () => void;
  warmupVideoUrl?: string;
  onDraw?: () => void;
  onBoard?: () => void;
}> = ({onHome, onComplete, warmupVideoUrl, onDraw, onBoard}) => (
  <GenericLesson
    content={content}
    onHome={onHome ?? (() => {})}
    onComplete={onComplete ?? (() => {})}
    warmupVideoUrl={warmupVideoUrl}
    onDraw={onDraw}
    onBoard={onBoard}
    stage={(props) => <MonsterTruckStage {...props} />}
    partPreview={(part) => <MonsterTruckPartPreview part={part} />}
  />
);

export default MonsterTruckLesson;
