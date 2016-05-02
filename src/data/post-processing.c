#include <stdio.h>
#include <math.h>
#include <stdlib.h>
#include <string.h>

// Slimfly basic configuration parameters
#define GLOBAL_CHANNELS 5			//(h): Number of global channels per router
#define LOCAL_CHANNELS 2        	//   : Number of local channels per router
#define NUM_ROUTER 5				//(a): Number of routers in each group
#define NUM_TERMINALS 3			//(p): Number of terminal connections per router

int main(int argc, char **argv)
{
	FILE * output_file=NULL;
	FILE * output_file_lp=NULL;
	FILE * output_file_pe=NULL;
    FILE * input_file=NULL;
    FILE * gvt_file=NULL;

	char log[100];
	sprintf( log, "slimfly-raw/slimfly-ross-stats-0.txt");
	gvt_file = fopen ( log, "r");
	if (gvt_file==NULL)
	{
		printf("Failed to Open Slim_fly gvt file %s \n",log);
	}

    if (argc != 2)
    {
        printf("Error: need to specific metric for data collection\n0:RSF,1:RSR,2:RRF,3:RRR,6:TGF,7:TGR,8:TSF,9:TSR,10:TRF,11:TRR\n");
        return EXIT_FAILURE;
    }

	char mystring[100000];
	char ch;
	int gvt_count = 0;					//Total number of GVT calculations in simulation
	printf("finding total number of gvt calculations\n");
	while( fgets(mystring , 100000 , gvt_file) != NULL )
	{
		gvt_count++;
	}
	gvt_count = gvt_count-4;		//Get rid of header and the typical last 3 nan lines
	printf("found %d gvt calculations\n",gvt_count);

	float *gvt;
	gvt = (float*)malloc(gvt_count*sizeof(float));

	rewind(gvt_file);

	char * line = NULL;
	char * pch;
	size_t len = 0;
	ssize_t read;
	int i,j,k,f;
	printf("extracting gvt times\n");
		read = getline(&line, &len, gvt_file);
	for(i=0; i<gvt_count; i++)
	{
		read = getline(&line, &len, gvt_file);
		pch = strtok (line,",");
		gvt[i] = atof(pch);
//		printf("gvt[%d]:%f\n",i,gvt[i]);
	}
    printf("gvt[%d]:%f\n",i,gvt[i-1]);
	fclose(gvt_file);

    int num_events;
	int num_stride_old = 7;				//Number of lps in old mapping before repeating pattern
	int num_stride_new = 4;				//Number of lps in new mapping before repeating pattern
    int num_pes = 16;
    int num_lps = 200;
    int num_metrics = 10;
	int selected_metric = 0;			//0:RSF,1:RSR,2:RRF,3:RRR,6:TGF,7:TGR,8:TSF,9:TSR,10:TRF,11:TRR
    int ***data = calloc(num_lps, sizeof(int**));
    int ***data2 = calloc(num_pes, sizeof(int**));
    int ***data3 = calloc(num_pes, sizeof(int**));
    int ***data4 = calloc(num_lps, sizeof(int**));

    for (i = 0; i < num_lps; i++)
    {
        data[i] = calloc(gvt_count, sizeof(int*));
        for (j = 0; j < gvt_count; j++)
        {
            data[i][j] = calloc(num_metrics, sizeof(int));
        }
    }
    for (i = 0; i < num_pes; i++)
    {
        data2[i] = calloc(gvt_count, sizeof(int*));
        for (j = 0; j < gvt_count; j++)
        {
            data2[i][j] = calloc(num_metrics, sizeof(int));
        }
    }
    for (i = 0; i < num_pes; i++)
    {
        data3[i] = calloc(num_pes, sizeof(int*));
        for (j = 0; j < num_pes; j++)
        {
            data3[i][j] = calloc(gvt_count, sizeof(int));
        }
    }
    for (i = 0; i < num_lps; i++)
    {
        data4[i] = calloc(num_lps, sizeof(int*));
        for (j = 0; j < num_lps; j++)
        {
            data4[i][j] = calloc(gvt_count, sizeof(int));
        }
    }
    //int data[num_lps][gvt_count][num_metrics];	//LP data
	//int data2[num_pes][gvt_count][num_metrics];	//PE data
	//int data3[num_pes][num_pes][gvt_count];		//PE connection data for one metric
    //int data4[num_lps][num_lps][gvt_count];		//PE connection data for one metric
    //printf("poop\n");
    printf("num_lps:%d gvt_count:%d\n",num_lps,gvt_count);
    printf("here\n");
//Loop over all data files
for(f=0; f<num_pes; f++)
{
    num_events = 0;
    printf("opening raw event file %d\n",f);
    sprintf( log, "slimfly-raw/event-log-%d.txt",f);
    input_file = fopen ( log, "r");
    if (input_file==NULL)
    {
        printf("Failed to Open Slim_fly input file %s \n",log);
    }
    
    printf("finding total number of events for pe\n");
    while( fgets(mystring , 100000 , input_file) != NULL )
    {
        num_events++;
    }
    num_events--;
    printf("num_events:%d\n",num_events);
    rewind(input_file);

	int x,x2,y,z,dst,dst2,temp_dst;
    float temp;
	int tempx;

	for(i=0;i<num_lps;i++)
	{
		for(j=0;j<gvt_count;j++)
		{
			for(k=0;k<num_metrics;k++)
			{
				data[i][j][k] = 0;
			}
		}
	}

    printf("parsing raw event data\n");
	for(i=0;i<num_events;i++)
	{
		read = getline(&line, &len, input_file);
		pch = strtok (line,",");
		tempx = atoi(pch);				//src LP ID
		if(tempx<num_stride_old)
		{
			x = (int)ceil(tempx/num_stride_old)*num_stride_new + tempx%num_stride_old - num_stride_new+1;
		}
		else
		{
			x = (int)floor(tempx/num_stride_old)*num_stride_new + tempx%num_stride_old - num_stride_new+1;
		}
		pch = strtok (NULL,",");
		temp_dst = atoi(pch);			//destination LP ID
		if(temp_dst<num_stride_old)
		{
			dst = (int)ceil(temp_dst/num_stride_old)*num_stride_new + temp_dst%num_stride_old - num_stride_new+1;
		}
		else
		{
			dst = (int)floor(temp_dst/num_stride_old)*num_stride_new + temp_dst%num_stride_old - num_stride_new+1;
		}
		pch = strtok (NULL,",");
		z = atoi(pch);				//event type
		pch = strtok (NULL,",");
		temp = atof(pch);
		j=0;
		while(temp>gvt[j] && j<gvt_count-1)
		{
            j++;
		}
        y = j;
        
		//printf("tempx:%d temp_dst:%d\n",tempx,temp_dst);
		//printf("x:%d y:%d z:%d x2:%d dst:%d\n",x,y,z,(int)floor(x/(int)ceil(num_lps/num_pes)),dst);

		x2 = (int)floor(x/(int)ceil((double)num_lps/num_pes));		//Get PE ID for given x LP ID
		dst2 = (int)floor(dst/(int)ceil((double)num_lps/num_pes));	//Get PE ID for given dst LP ID

		if(z!=9 && dst >= 0)
		{
		    data[x][y][z]+=1;            //increment associated metric
			data2[x2][y][z]+=1;
		    data4[x][dst][y]+=1;
		
			if(data[x][y][z] > 100)
				printf("data[%d][%d][%d]:%d\n",x,y,z,data[x][y][z]);
			if(z==selected_metric)
			{
	/*			if(x == 199)
				{	
					if(y >3374)
					{
						printf("data[%d][%d][%d]:%d\n",x,y,z,data[x][y][z]);
					}
				}
	*/			data3[x2][dst2][y]+=1;			//increment number of messages transfered on the connection for given gvt bin
			}
		}
//        printf("file:%d i:%d j:%d oldx:%d x2:%d x:%d y:%d z:%d data:%d\n",f,i,j,tempx,(int)floor(x/(int)ceil(num_lps/num_pes)),x,y,z,data[x][y][z]);
    }
    fclose(input_file);
}


//-------------------------------------
//Event data per metric per PE and LP
//-------------------------------------
//Loop over all output metric data files
//for(f=0; f<num_metrics; f++)
//{
	printf("Opening lp output file\n");
	sprintf( log, "slimfly-processed/forward-send-event-log-lp.txt");
	output_file_lp = fopen ( log, "w");
	if (output_file_lp==NULL)
	{
		printf("Failed to Open Slim_fly lp output file %s \n",log);
	}

	printf("Opening pe output file\n");
	sprintf( log, "slimfly-processed/forward-send-event-log-pe.txt");
	output_file_pe = fopen ( log, "w");
	if (output_file_pe==NULL)
	{
		printf("Failed to Open Slim_fly pe output file %s \n",log);
	}

	printf("Printing output LP and PE data\n");
	fprintf(output_file_lp,"gvt,");
	fprintf(output_file_pe,"gvt,");
	for(i=0;i<num_lps-1;i++)
	{
		fprintf(output_file_lp,"LP_%d,",i); 
	}
	for(i=0;i<num_pes-1;i++)
	{
		fprintf(output_file_pe,"PE_%d,",i);
	} 
	fprintf(output_file_lp,"LP_%d\n",num_lps-1);
	fprintf(output_file_pe,"PE_%d\n",num_pes-1);
	for(i=0;i<gvt_count;i++)
	{
//		printf("gvt:%d\n",i);
		fprintf(output_file_lp,"%6.6f,",gvt[i]);
		fprintf(output_file_pe,"%6.6f,",gvt[i]);
		for(j=0;j<num_lps-1;j++)
		{
			fprintf(output_file_lp,"%2d,",data[j][i][selected_metric]);
		}
		fprintf(output_file_lp,"%2d\n",data[num_lps-1][i][selected_metric]);
		for(j=0;j<num_pes-1;j++)
		{
			fprintf(output_file_pe,"%2d,",data2[j][i][selected_metric]);
		}
		fprintf(output_file_pe,"%2d\n",data2[num_pes-1][i][selected_metric]);
	}

	fclose(output_file_lp);
	fclose(output_file_pe);

//-------------------------------------
//PE connection event data
//-------------------------------------
	printf("Opening connection output file\n");
	sprintf( log, "slimfly-processed/forward-send-event-log-connections.txt");
	output_file = fopen ( log, "w");
	if (output_file==NULL)
	{
		printf("Failed to Open Slim_fly connection output file %s \n",log);
	}

	for(k=0;k<gvt_count;k++)
	{
		for(j=0;j<num_pes;j++)
		{
			for(i=0;i<num_pes-1;i++)
			{
				fprintf(output_file,"%d, ",data3[i][j][k]);
			}
				fprintf(output_file,"%d\n",data3[i][j][k]);
		}
	}
    fclose(output_file);

//-------------------------------------
//PE JSON connection event data
//-------------------------------------
	printf("Opening JSON PE connection output file\n");
	sprintf( log, "slimfly-processed/forward-send-event-log-connections-pe.json");
	output_file = fopen ( log, "w");
	if (output_file==NULL)
	{
		printf("Failed to Open Slim_fly JSON PE connection output file %s \n",log);
	}

	int gvt_indx = 3000;
	int print_count = 0;
//	for(k=0;k<gvt_count;k++)
	{
		fprintf(output_file,"[\n");
		for(j=0;j<num_pes;j++)
		{
			print_count = 0;
			for(i=0;i<num_pes;i++)
			{
				if(data3[j][i][gvt_indx]>0)
				{
					print_count++;
					sprintf(log,"{\"name\":\"PE %d\",\"num_messages\":%d,\"gvt\":%f,\"connections\":[\"PE %d\"]},\n",j,data3[j][i][gvt_indx],gvt[gvt_indx],i);
            		fprintf(output_file,"%s",log);
				}
			}
			if(print_count == 0 )
			{
				sprintf(log,"{\"name\":\"PE %d\",\"num_messages\":%d,\"connections\":[]},\n",j,0);
				fprintf(output_file,"%s",log);
			}
			if(j==num_pes-1)
			{
				sprintf(log,"{\"name\":\"PE %d\",\"num_messages\":%d,\"connections\":[]}\n",j,0);
				fprintf(output_file,"%s",log);
			}
		}
		fprintf(output_file,"]\n");
	}
    fclose(output_file);

    //-------------------------------------
    //LP JSON connection event data
    //-------------------------------------
    printf("Opening JSON LP connection output file\n");
    sprintf( log, "slimfly-processed/forward-send-event-log-connections-lp.json");
    output_file = fopen ( log, "w");
    if (output_file==NULL)
    {
        printf("Failed to Open Slim_fly JSON LP connection output file %s \n",log);
    }
    
    print_count = 0;
    //	for(k=0;k<gvt_count;k++)
    {
        fprintf(output_file,"[\n");
        for(j=0;j<num_lps;j++)
        {
			print_count = 0;
            for(i=0;i<num_lps;i++)
            {
                if(data4[j][i][gvt_indx]>0)
                {
					print_count++;
					sprintf(log,"{\"name\":\"LP %d\",\"num_messages\":%d,\"gvt\":%f,\"connections\":[\"LP %d\"]},\n",j,data4[j][i][gvt_indx],gvt[gvt_indx],i);
            		fprintf(output_file,"%s",log);
                }
            }
			if(print_count == 0 )
			{
				sprintf(log,"{\"name\":\"LP %d\",\"num_messages\":%d,\"connections\":[]},\n",j,0);
				fprintf(output_file,"%s",log);
			}
			if(j==num_lps-1)
			{
				sprintf(log,"{\"name\":\"LP %d\",\"num_messages\":%d,\"connections\":[]}\n",j,0);
				fprintf(output_file,"%s",log);
			}
        }
        fprintf(output_file,"]\n");
    }
    fclose(output_file);

   	return 0;
}
