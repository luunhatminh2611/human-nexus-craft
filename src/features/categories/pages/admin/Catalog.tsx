// pages/Catalog.tsx
import { useState } from 'react';
import { Card, CardHeader } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import JobTitlesTab from '@/features/categories/components/JobTitle';
import MajorsTab from '@/features/categories/components/Majors';
import DegreesTab from '@/features/categories/components/Degrees';
import RolesTab from '../../components/Roles';
import EthnicitiesTab from '@/features/categories/components/Ethnicity';
import WardsTab from '@/features/categories/components/Ward';
import ProvincesTab from '@/features/categories/components/ProvinceCity';
import SpecialtiesTab from '@/features/categories/components/Specialty';
import PoliticalTheoriesTab from '@/features/categories/components/PoliticalTheory';
import LanguageLevelsTab from '@/features/categories/components/LanguageLevel';
import Nationality from '@/features/categories/components/Nationality';

export default function Catalog() {
  const [activeTab, setActiveTab] = useState('jobTitles');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Danh mục đào tạo & chức danh</h1>
        <p className="text-muted-foreground">Quản lý các danh mục trong hệ thống</p>
      </div>

      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="jobTitles">Chức danh</TabsTrigger>
              <TabsTrigger value="nationality">Quốc tịch</TabsTrigger>
              <TabsTrigger value="majors">Ngành nghề</TabsTrigger>
              <TabsTrigger value="degrees">Bậc học</TabsTrigger>
              <TabsTrigger value="ethnicities">Dân tộc</TabsTrigger>
            </TabsList>
            
            <TabsList className="grid grid-cols-5 w-full mt-2">
              <TabsTrigger value="wards">Phường/Xã</TabsTrigger>
              <TabsTrigger value="provinces">Tỉnh/TP</TabsTrigger>
              <TabsTrigger value="specialties">Chuyên ngành</TabsTrigger>
              <TabsTrigger value="politicalTheories">Lý luận CT</TabsTrigger>
              <TabsTrigger value="languageLevels">Trình độ NN</TabsTrigger>
            </TabsList>

            <TabsContent value="nationality">
              <Nationality />
            </TabsContent>

            <TabsContent value="jobTitles">
              <JobTitlesTab />
            </TabsContent>

            <TabsContent value="majors">
              <MajorsTab />
            </TabsContent>

            <TabsContent value="degrees">
              <DegreesTab />
            </TabsContent>

            <TabsContent value="ethnicities">
              <EthnicitiesTab />
            </TabsContent>

            <TabsContent value="wards">
              <WardsTab />
            </TabsContent>

            <TabsContent value="provinces">
              <ProvincesTab />
            </TabsContent>

            <TabsContent value="specialties">
              <SpecialtiesTab />
            </TabsContent>

            <TabsContent value="politicalTheories">
              <PoliticalTheoriesTab />
            </TabsContent>

            <TabsContent value="languageLevels">
              <LanguageLevelsTab />
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  );
}