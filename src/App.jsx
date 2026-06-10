import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Library from './pages/Library';
import VersionsGrid from './pages/VersionsGrid';
import ChooseAudience from './pages/ChooseAudience';
import CreatingVersion from './pages/CreatingVersion';
import RCClubFlow from './pages/RCClubFlow';
import GuidedConfig from './pages/GuidedConfig';
import CompareVersions from './pages/CompareVersions';
import Report from './pages/Report';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Library />} />
        <Route path="/library" element={<Navigate to="/" replace />} />
        <Route path="/versions" element={<VersionsGrid />} />
        <Route path="/versions/audience" element={<ChooseAudience />} />
        <Route path="/versions/creating" element={<CreatingVersion />} />
        <Route path="/versions/rc-club" element={<RCClubFlow />} />
        <Route path="/versions/configure" element={<GuidedConfig />} />
        <Route path="/versions/compare" element={<CompareVersions />} />
        <Route path="/report" element={<Report />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
