import { useTrip } from '../../context/TripContext';
import AiTripGuideTab from '../../features/trips/AiTripGuideTab';

export default function TripAiGuidePage() {
  const { trip, members } = useTrip();

  return <AiTripGuideTab trip={trip} membersCount={members?.length || 1} />;
}