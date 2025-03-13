import { PieChart } from '@mui/x-charts/PieChart';
export type PieData = {
    pieData:{
        num_gaps: number;
        num_majors: number;
        num_minors: number;

    }
};
export default function Pie( pieChartData : PieData) {
    
    const data = [
        { id: 0, value: pieChartData.pieData.num_minors, label: 'Minor' },
        { id: 1, value: pieChartData.pieData.num_majors, label: 'Major' },
        // { id: 2, value: pieChartData.pieData.num_gaps, label: 'Opportunities\nfor Improvement' },
    ];
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <PieChart
                colors={['#DDC576', '#507D8E', '#65BAB2']}
                series={[
                    {
                        data: data.map((item) => ({
                            id: item.id,
                            value: item.value,
                            label: `${item.label} (${item.value})`,
                        })),
                        innerRadius:50,
                        cx: 90,
                        cy: 100,
                    },
                    
                ]}
                width={380}
                height={200}
            />
        </div>
    );
}
